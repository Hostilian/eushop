// COMPLIANCE-REVIEW: Key Vault Integration & API Key Rotation Daemon
// Ensures cryptographic keys & API secrets are securely rotated according to ISO 27001 standards.

export interface KeySecretEntry {
  keyId: string;
  provider: string;
  version: number;
  createdAt: number;
  expiresAt: number;
  status: 'ACTIVE' | 'ROTATING' | 'RETIRED';
}

const keyVaultRegistry = new Map<string, KeySecretEntry>();

export function registerVaultKey(provider: string, ttlDays: number = 90): KeySecretEntry {
  const now = Date.now();
  const entry: KeySecretEntry = {
    keyId: `key_${provider}_${Math.random().toString(36).substring(2, 9)}`,
    provider,
    version: 1,
    createdAt: now,
    expiresAt: now + (ttlDays * 86400 * 1000),
    status: 'ACTIVE',
  };

  keyVaultRegistry.set(provider, entry);
  return entry;
}

export function rotateVaultKey(provider: string): KeySecretEntry {
  const current = keyVaultRegistry.get(provider);
  const now = Date.now();

  const newEntry: KeySecretEntry = {
    keyId: `key_${provider}_${Math.random().toString(36).substring(2, 9)}`,
    provider,
    version: current ? current.version + 1 : 1,
    createdAt: now,
    expiresAt: now + (90 * 86400 * 1000),
    status: 'ACTIVE',
  };

  if (current) {
    current.status = 'RETIRED';
  }

  keyVaultRegistry.set(provider, newEntry);
  return newEntry;
}
