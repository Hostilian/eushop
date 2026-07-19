/**
 * Degradation utilities for graceful API failure handling.
 * Provides fallback mechanisms: live API -> cached data -> demonstration data.
 */

import { APIError } from './errors';

/**
 * Cache entry structure
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number; // Unix timestamp in milliseconds
}

/**
 * Get cached data if it exists and is not expired
 * @param key Storage key
 * @param maxAgeMs Maximum age in milliseconds (default: 24 hours)
 * @returns Cached data or null if not found/expired
 */
function getCachedData<T>(key: string, maxAgeMs: number = 24 * 60 * 60 * 1000): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp }: CacheEntry<T> = JSON.parse(cached);
    const now = Date.now();

    if (now - timestamp > maxAgeMs) {
      // Expired, remove it
      localStorage.removeItem(key);
      return null;
    }

    return data;
  } catch (error) {
    // Corrupted cache, remove it
    localStorage.removeItem(key);
    return null;
  }
}

/**
 * Save data to cache with timestamp
 * @param key Storage key
 * @param data Data to cache
 */
function setCachedData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;

  try {
    const cacheEntry: CacheEntry<T> = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(cacheEntry));
  } catch (error) {
    console.warn('Failed to cache data:', error);
  }
}

/**
 * Wrapper for API calls with fallback to cached data and then demonstration data
 * @param apiCall Function that performs the API call and returns a promise
 * @param cacheKey Key for caching the successful response
 * @param demoDataProvider Function that returns demonstration data (or promise of it)
 * @param options Configuration options
 * @returns Promise resolving to the data (from API, cache, or demo)
 */
export async function withFallback<T>(
  apiCall: () => Promise<T>,
  cacheKey: string,
  demoDataProvider: () => T | Promise<T>,
  options: {
    cacheDurationMs?: number; // Default: 24 hours
    demoDataTimeoutMs?: number; // Timeout for demo data provider
  } = {}
): Promise<T> {
  const { cacheDurationMs = 24 * 60 * 60 * 1000, demoDataTimeoutMs = 5000 } = options;

  // Try 1: Live API call
  try {
    const result = await apiCall();
    // If successful, cache the result
    setCachedData<T>(cacheKey, result);
    return result;
  } catch (apiError) {
    console.warn(`API call failed for ${cacheKey}, trying fallback:`, apiError);

    // Try 2: Cached data
    const cachedData = getCachedData<T>(cacheKey, cacheDurationMs);
    if (cachedData !== null) {
      console.log(`Using cached data for ${cacheKey}`);
      return cachedData;
    }

    // Try 3: Demonstration data
    try {
      const demoData = await Promise.resolve(demoDataProvider());
      console.log(`Using demonstration data for ${cacheKey}`);
      return demoData;
    } catch (demoError) {
      console.error(`Demonstration data provider failed for ${cacheKey}:`, demoError);
      // If even the demo data fails, we have to throw an error
      // However, we should ensure demo data is always available
      throw new Error(`All data sources failed for ${cacheKey}. Last error: ${demoError.message}`);
    }
  }
}

/**
 * Specialized wrapper for food API calls that uses the fallbackTrendingFoods as demonstration data
 * We import the fallback data here to avoid circular dependencies
 */
import { fallbackTrendingFoods } from './services';

/**
 * Get demonstration data for food lists
 */
export function getFoodListDemoData(): any[] {
  return fallbackTrendingFoods;
}

/**
 * Get demonstration data for a single food item by ID
 * @param id The food ID to find in demonstration data
 */
export function getFoodItemDemoData(id: string): any | null {
  const demoFoods = fallbackTrendingFoods;
  const found = demoFoods.find(food => food.id === id);
  return found || null;
}