/**
 * Degradation utilities for graceful API failure handling.
 * Provides fallback mechanisms: live API -> cached data -> demonstration data.
 * Includes timeout handling, circuit breaker pattern, and source tracking.
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
 * Wrapper for a promise that adds a timeout
 * @param promiseFn Function that returns a promise
 * @param timeoutMs Timeout in milliseconds
 * @returns Promise that rejects with a timeout error if exceeded
 */
function withTimeout<T>(promiseFn: () => Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promiseFn(),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
    })
  ]);
}

/**
 * Circuit breaker state
 */
enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

/**
 * Circuit breaker implementation to prevent repeated calls to a failing service
 */
class CircuitBreaker {
  public state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  public failureCount: number = 0;
  public lastFailureTime: number = 0;
  public failureThreshold: number;
  public timeoutMs: number;
  private timeoutCallback: (newState: CircuitBreakerState) => void;

  constructor(
    failureThreshold: number = 5,
    timeoutMs: number = 60000, // 1 minute
    onStateChange?: (newState: CircuitBreakerState) => void
  ) {
    this.failureThreshold = failureThreshold;
    this.timeoutMs = timeoutMs;
    this.timeoutCallback = onStateChange || ((_) => {});
  }

  /**
   * Attempt to execute a function, respecting the circuit breaker state
   * @param fn Function to execute
   * @returns Promise resolving to the function's result
   */
  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      // Check if timeout has passed to try half-open
      if (Date.now() - this.lastFailureTime > this.timeoutMs) {
        this.setState(CircuitBreakerState.HALF_OPEN);
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      // Success: reset failure count and close circuit if in half-open
      if (this.state === CircuitBreakerState.HALF_OPEN) {
        this.setState(CircuitBreakerState.CLOSED);
      }
      this.failureCount = 0;
      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();
      if (this.failureCount >= this.failureThreshold) {
        this.setState(CircuitBreakerState.OPEN);
      }
      throw error;
    }
  }

  private setState(newState: CircuitBreakerState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.timeoutCallback(this.state);
    }
  }

  /**
   * Get current state (mainly for testing/debugging)
   */
  getState(): CircuitBreakerState {
    return this.state;
  }
}

/**
 * Map of circuit breakers keyed by cacheKey for shared state
 */
const circuitBreakerMap = new Map<string, CircuitBreaker>();

/**
 * Get or create a circuit breaker for a given key
 * @param key Identifier for the circuit breaker
 * @returns CircuitBreaker instance
 */
function getCircuitBreaker(key: string): CircuitBreaker {
  if (!circuitBreakerMap.has(key)) {
    circuitBreakerMap.set(key, new CircuitBreaker(5, 60000)); // 5 failures, 60s timeout
  }
  return circuitBreakerMap.get(key)!;
}

/**
 * Wrapper for API calls with fallback to cached data and then demonstration data.
 * Includes timeout handling, circuit breaker, and source tracking.
 * @param apiCall Function that performs the API call and returns a promise
 * @param cacheKey Key for caching the successful response
 * @param demoDataProvider Function that returns demonstration data (or promise of it)
 * @param options Configuration options
 * @returns Promise resolving to an object containing the data and its source
 */
export async function withFallback<T>(
  apiCall: () => Promise<T>,
  cacheKey: string,
  demoDataProvider: () => T | Promise<T>,
  options: {
    cacheDurationMs?: number; // Default: 24 hours
    demoDataTimeoutMs?: number; // Timeout for demo data provider
    apiTimeoutMs?: number; // Timeout for API call (default: 10 seconds)
    circuitBreakerKey?: string; // Key for circuit breaker (defaults to cacheKey)
    circuitBreakerFailureThreshold?: number; // Default: 5
    circuitBreakerTimeoutMs?: number; // Default: 60000
  } = {}
): Promise<{ data: T; source: 'live' | 'cache' | 'demo' | 'local' | 'offline' }> {
  const {
    cacheDurationMs = 24 * 60 * 60 * 1000,
    demoDataTimeoutMs = 5000,
    apiTimeoutMs = 10000,
    circuitBreakerKey = cacheKey,
    circuitBreakerFailureThreshold = 5,
    circuitBreakerTimeoutMs = 60000
  } = options;

  // Try 1: Live API call with timeout and circuit breaker
  try {
    const cb = getCircuitBreaker(circuitBreakerKey);
    cb.failureThreshold = circuitBreakerFailureThreshold;
    cb.timeoutMs = circuitBreakerTimeoutMs;

    const timedApiCall = () => withTimeout(apiCall, apiTimeoutMs);
    const result = await cb.call(() => timedApiCall());

    // If successful, cache the result
    setCachedData<T>(cacheKey, result);
    return { data: result, source: 'live' };
  } catch (apiError) {
    console.warn(`API call failed for ${cacheKey}, trying fallback:`, apiError);

    // Try 2: Cached data
    const cachedData = getCachedData<T>(cacheKey, cacheDurationMs);
    if (cachedData !== null) {
      console.log(`Using cached data for ${cacheKey}`);
      return { data: cachedData, source: 'cache' };
    }

    // Try 3: Demonstration data with timeout
    try {
      const demoData = await withTimeout(() => Promise.resolve(demoDataProvider()), demoDataTimeoutMs);
      console.log(`Using demonstration data for ${cacheKey}`);
      return { data: demoData, source: 'demo' };
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

export { withTimeout, CircuitBreaker };