export type StorageArea = 'local' | 'session';

export type StorageWriteFailure =
  | 'unavailable'
  | 'invalid'
  | 'sensitive'
  | 'quota'
  | 'serialization';

export type StorageWriteResult =
  | { ok: true }
  | { ok: false; reason: StorageWriteFailure };

interface StorageEnvelope<T> {
  marker: 'eushop-storage';
  version: number;
  savedAt: number;
  data: T;
}

export interface StorageSchema<T> {
  key: string;
  version: number;
  area?: StorageArea;
  fallback: () => T;
  validate: (value: unknown) => value is T;
  migrate?: (value: unknown, previousVersion: number | null) => T | null;
  maxBytes?: number;
  /** Test-only or non-browser adapter. Browser callers should omit this. */
  storageOverride?: Storage;
}

export interface StoredCartItem {
  id: string;
  name: string;
  country: string;
  price: number;
  quantity: number;
  sellerId?: string;
  finderFee?: number;
}

const DEFAULT_MAX_BYTES = 512 * 1024;
const BLOCKED_KEY = /(?:password|secret|token|authorization|userprofile|usersession|tax|vat|tin|address|email|order|seller[_-]?application)/i;
const SENSITIVE_FIELD = /(?:password|secret|token|authorization|cookie|email|phone|address|taxId|vatNumber|tin|tradeRegisterNumber|personalId)/i;
const SENSITIVE_VALUE = /(?:\bBearer\s+[A-Za-z0-9._~-]+|\b(?:sk|pk)_(?:live|test)_[A-Za-z0-9]+|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)/;

const UNSAFE_LEGACY_LOCAL_KEYS = [
  'local_foods',
  'orders',
  'search_fallback',
  'search_fallback_timestamp',
  'seller_applications',
  'userSession',
  'waitlist_emails',
] as const;
const UNSAFE_LEGACY_SESSION_KEYS = ['userProfile'] as const;

function getStorage(area: StorageArea, override?: Storage): Storage | null {
  if (override) return override;
  if (typeof window === 'undefined') return null;

  try {
    return area === 'session' ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

function isEnvelope(value: unknown): value is StorageEnvelope<unknown> {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<StorageEnvelope<unknown>>;
  return candidate.marker === 'eushop-storage' && Number.isInteger(candidate.version);
}

function containsSensitiveData(value: unknown, seen = new WeakSet<object>()): boolean {
  if (typeof value === 'string') return SENSITIVE_VALUE.test(value);
  if (!value || typeof value !== 'object') return false;
  if (seen.has(value)) return false;
  seen.add(value);

  if (Array.isArray(value)) {
    return value.some(item => containsSensitiveData(item, seen));
  }

  return Object.entries(value).some(([key, nested]) =>
    SENSITIVE_FIELD.test(key) || containsSensitiveData(nested, seen),
  );
}

function removeQuietly(storage: Storage, key: string): void {
  try {
    storage.removeItem(key);
  } catch {
    // An unavailable storage provider is equivalent to an empty cache.
  }
}

function isQuotaError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as { name?: string; code?: number };
  return candidate.name === 'QuotaExceededError' ||
    candidate.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    candidate.code === 22 ||
    candidate.code === 1014;
}

/** Read, validate, migrate, or reset one versioned browser-storage entry. */
export function readSafeStorage<T>(schema: StorageSchema<T>): T {
  const storage = getStorage(schema.area ?? 'local', schema.storageOverride);
  if (!storage || BLOCKED_KEY.test(schema.key)) return schema.fallback();

  let raw: string | null;
  try {
    raw = storage.getItem(schema.key);
  } catch {
    return schema.fallback();
  }
  if (!raw) return schema.fallback();

  try {
    const parsed: unknown = JSON.parse(raw);
    if (isEnvelope(parsed)) {
      if (parsed.version === schema.version && schema.validate(parsed.data)) {
        return parsed.data;
      }

      const migrated = schema.migrate?.(parsed.data, parsed.version) ?? null;
      if (migrated !== null && schema.validate(migrated)) {
        writeSafeStorage(schema, migrated);
        return migrated;
      }
    } else {
      const migrated = schema.migrate?.(parsed, null) ?? null;
      if (migrated !== null && schema.validate(migrated)) {
        writeSafeStorage(schema, migrated);
        return migrated;
      }
    }
  } catch {
    // Invalid JSON is reset below.
  }

  removeQuietly(storage, schema.key);
  return schema.fallback();
}

/** Validate and write a versioned entry without leaking provider exceptions. */
export function writeSafeStorage<T>(schema: StorageSchema<T>, data: T): StorageWriteResult {
  const storage = getStorage(schema.area ?? 'local', schema.storageOverride);
  if (!storage) return { ok: false, reason: 'unavailable' };
  if (BLOCKED_KEY.test(schema.key) || containsSensitiveData(data)) {
    return { ok: false, reason: 'sensitive' };
  }
  if (!schema.validate(data)) return { ok: false, reason: 'invalid' };

  let serialized: string;
  try {
    const envelope: StorageEnvelope<T> = {
      marker: 'eushop-storage',
      version: schema.version,
      savedAt: Date.now(),
      data,
    };
    serialized = JSON.stringify(envelope);
  } catch {
    return { ok: false, reason: 'serialization' };
  }

  if (serialized.length * 2 > (schema.maxBytes ?? DEFAULT_MAX_BYTES)) {
    return { ok: false, reason: 'quota' };
  }

  try {
    storage.setItem(schema.key, serialized);
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: isQuotaError(error) ? 'quota' : 'unavailable' };
  }
}

export function removeSafeStorage(
  key: string,
  area: StorageArea = 'local',
  storageOverride?: Storage,
): void {
  const storage = getStorage(area, storageOverride);
  if (storage) removeQuietly(storage, key);
}

/**
 * Removes browser-persisted legacy records known to contain account, order, or
 * seller tax/contact data.
 *
 * COMPLIANCE-REVIEW: this client cleanup is data-minimisation defence in depth;
 * it is not a substitute for server-side GDPR erasure, retention, or audit rules.
 */
export function purgeUnsafeLegacyStorage(): number {
  let removed = 0;
  const local = getStorage('local');
  const session = getStorage('session');

  for (const key of UNSAFE_LEGACY_LOCAL_KEYS) {
    try {
      if (local?.getItem(key) !== null) {
        local.removeItem(key);
        removed += 1;
      }
    } catch {
      // Continue purging independent keys and providers.
    }
  }
  for (const key of UNSAFE_LEGACY_SESSION_KEYS) {
    try {
      if (session?.getItem(key) !== null) {
        session.removeItem(key);
        removed += 1;
      }
    } catch {
      // Continue purging independent keys and providers.
    }
  }
  return removed;
}

function isStoredCartItem(value: unknown): value is StoredCartItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<StoredCartItem>;
  return typeof item.id === 'string' && item.id.length > 0 &&
    typeof item.name === 'string' && item.name.length > 0 &&
    typeof item.country === 'string' && item.country.length > 0 &&
    typeof item.price === 'number' && Number.isFinite(item.price) && item.price >= 0 &&
    typeof item.quantity === 'number' && Number.isInteger(item.quantity) &&
    item.quantity >= 1 && item.quantity <= 100 &&
    (item.sellerId === undefined || typeof item.sellerId === 'string') &&
    (item.finderFee === undefined || (typeof item.finderFee === 'number' && Number.isFinite(item.finderFee)));
}

export const CART_STORAGE_SCHEMA: StorageSchema<StoredCartItem[]> = {
  key: 'cart',
  version: 1,
  fallback: () => [],
  validate: (value): value is StoredCartItem[] =>
    Array.isArray(value) && value.length <= 50 && value.every(isStoredCartItem),
  migrate: value =>
    Array.isArray(value) && value.length <= 50 && value.every(isStoredCartItem) ? value : null,
  maxBytes: 128 * 1024,
};

export function readCart(): StoredCartItem[] {
  return readSafeStorage(CART_STORAGE_SCHEMA);
}

export function writeCart(items: StoredCartItem[]): StorageWriteResult {
  return writeSafeStorage(CART_STORAGE_SCHEMA, items.slice(0, 50));
}
