import {
  CART_STORAGE_SCHEMA,
  purgeUnsafeLegacyStorage,
  readSafeStorage,
  writeSafeStorage,
  type StorageSchema,
} from '../lib/storageSafety';

function createStorage(throwOnWrite?: unknown): Storage {
  const values = new Map<string, string>();
  return {
    get length() { return values.size; },
    clear: () => values.clear(),
    getItem: key => values.get(key) ?? null,
    key: index => [...values.keys()][index] ?? null,
    removeItem: key => { values.delete(key); },
    setItem: (key, value) => {
      if (throwOnWrite) throw throwOnWrite;
      values.set(key, value);
    },
  };
}

describe('storage safety', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('migrates a valid legacy cart into a versioned envelope', () => {
    const storage = createStorage();
    const legacy = [{ id: '1', name: 'Food', country: 'BE', price: 5, quantity: 1 }];
    storage.setItem('cart', JSON.stringify(legacy));

    const result = readSafeStorage({ ...CART_STORAGE_SCHEMA, storageOverride: storage });

    expect(result).toEqual(legacy);
    expect(JSON.parse(storage.getItem('cart') ?? '{}')).toMatchObject({
      marker: 'eushop-storage',
      version: 1,
      data: legacy,
    });
  });

  it('removes corrupt or schema-invalid entries and returns a safe default', () => {
    const storage = createStorage();
    storage.setItem('cart', '{bad json');

    expect(readSafeStorage({ ...CART_STORAGE_SCHEMA, storageOverride: storage })).toEqual([]);
    expect(storage.getItem('cart')).toBeNull();
  });

  it('reports quota errors without throwing', () => {
    const storage = createStorage({ name: 'QuotaExceededError', code: 22 });
    const result = writeSafeStorage({ ...CART_STORAGE_SCHEMA, storageOverride: storage }, []);
    expect(result).toEqual({ ok: false, reason: 'quota' });
  });

  it('rejects sensitive keys and sensitive nested fields', () => {
    const storage = createStorage();
    const stringSchema: StorageSchema<string> = {
      key: 'auth-token',
      version: 1,
      fallback: () => '',
      validate: (value): value is string => typeof value === 'string',
      storageOverride: storage,
    };
    const objectSchema: StorageSchema<{ email: string }> = {
      key: 'draft',
      version: 1,
      fallback: () => ({ email: '' }),
      validate: (value): value is { email: string } => Boolean(value),
      storageOverride: storage,
    };

    expect(writeSafeStorage(stringSchema, 'value')).toEqual({ ok: false, reason: 'sensitive' });
    expect(writeSafeStorage(objectSchema, { email: 'buyer@example.test' }))
      .toEqual({ ok: false, reason: 'sensitive' });
    expect(storage.length).toBe(0);
  });

  it('purges known unsafe legacy account, seller, and order keys', () => {
    window.localStorage.setItem('orders', '[{"shippingAddress":"private"}]');
    window.localStorage.setItem('cart', '[]');
    window.sessionStorage.setItem('userProfile', '{"email":"private"}');

    expect(purgeUnsafeLegacyStorage()).toBe(2);
    expect(window.localStorage.getItem('orders')).toBeNull();
    expect(window.sessionStorage.getItem('userProfile')).toBeNull();
    expect(window.localStorage.getItem('cart')).toBe('[]');
  });
});
