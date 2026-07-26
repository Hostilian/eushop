import { readSafeStorage, writeSafeStorage, StorageSchema } from '../storageSafety';

export interface AnonymousFoodPreferences {
  deliveryCountry?: string;
  categoryIds?: string[];
  regionIds?: string[];
  dietaryPreferences?: string[];
  excludedAllergens?: string[];
  updatedAt?: number;
}

const PREFERENCES_STORAGE_KEY = 'eushop_anonymous_preferences';
const PREFERENCES_VERSION = 1;

export const DEFAULT_ANONYMOUS_PREFERENCES: AnonymousFoodPreferences = {
  deliveryCountry: '',
  categoryIds: [],
  regionIds: [],
  dietaryPreferences: [],
  excludedAllergens: [],
  updatedAt: Date.now(),
};

const preferencesSchema: StorageSchema<AnonymousFoodPreferences> = {
  key: PREFERENCES_STORAGE_KEY,
  version: PREFERENCES_VERSION,
  area: 'local',
  fallback: () => ({ ...DEFAULT_ANONYMOUS_PREFERENCES }),
  validate: (value: unknown): value is AnonymousFoodPreferences => {
    if (!value || typeof value !== 'object') return false;
    const p = value as Partial<AnonymousFoodPreferences>;
    if (p.deliveryCountry !== undefined && typeof p.deliveryCountry !== 'string') return false;
    if (p.categoryIds !== undefined && !Array.isArray(p.categoryIds)) return false;
    if (p.regionIds !== undefined && !Array.isArray(p.regionIds)) return false;
    if (p.dietaryPreferences !== undefined && !Array.isArray(p.dietaryPreferences)) return false;
    if (p.excludedAllergens !== undefined && !Array.isArray(p.excludedAllergens)) return false;
    return true;
  },
};

export function getAnonymousPreferences(): AnonymousFoodPreferences {
  return readSafeStorage(preferencesSchema);
}

export function saveAnonymousPreferences(
  prefs: Partial<AnonymousFoodPreferences>,
): { ok: boolean } {
  const current = getAnonymousPreferences();
  const updated: AnonymousFoodPreferences = {
    ...current,
    ...prefs,
    updatedAt: Date.now(),
  };
  const result = writeSafeStorage(preferencesSchema, updated);
  if (result.ok && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('eushop-preferences-updated', { detail: updated }));
  }
  return { ok: result.ok };
}

export function clearAnonymousPreferences(): void {
  writeSafeStorage(preferencesSchema, { ...DEFAULT_ANONYMOUS_PREFERENCES, updatedAt: Date.now() });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('eushop-preferences-updated', { detail: DEFAULT_ANONYMOUS_PREFERENCES }));
  }
}
