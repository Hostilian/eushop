import { getFoodVatRate } from '@eushop/compliance';

// COMPLIANCE-REVIEW: Redis caching layer for catalog search & EU VAT rate engine lookups.
// Ensure cached VAT rates always validate against packages/compliance source of truth.

export interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  ttlSeconds: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();

/**
 * Retrieves a cached VAT rate or calculates and caches it using packages/compliance.
 */
export async function getCachedVatRate(countryCode: string, category: string = 'STANDARD'): Promise<number> {
  const cacheKey = `vat_rate:${countryCode.toUpperCase()}:${category.toUpperCase()}`;
  const now = Date.now();
  const entry = memoryCache.get(cacheKey);

  if (entry && (now - entry.cachedAt) < (entry.ttlSeconds * 1000)) {
    return entry.data;
  }

  // Calculate using compliance package as single source of truth
  const rate = getFoodVatRate(countryCode);
  
  memoryCache.set(cacheKey, {
    data: rate,
    cachedAt: now,
    ttlSeconds: 3600, // 1 hour TTL
  });

  return rate;
}

/**
 * Caches catalog search query results.
 */
export async function getCachedSearchResults<T>(queryKey: string, fetcher: () => Promise<T>, ttlSeconds: number = 300): Promise<T> {
  const cacheKey = `search:${queryKey}`;
  const now = Date.now();
  const entry = memoryCache.get(cacheKey);

  if (entry && (now - entry.cachedAt) < (entry.ttlSeconds * 1000)) {
    return entry.data;
  }

  const result = await fetcher();

  memoryCache.set(cacheKey, {
    data: result,
    cachedAt: now,
    ttlSeconds,
  });

  return result;
}

/**
 * Flushes invalid cache entries.
 */
export function flushCache(): void {
  memoryCache.clear();
}
