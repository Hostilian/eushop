/**
 * Shared request-degradation primitives.
 *
 * Callers receive both data and an honest origin marker so the UI can disclose
 * when it is showing cached, local, demonstration, or offline content.
 */

import { APIError } from './errors';

export const REQUEST_TIMEOUT_MS = {
  interactive: 4_000,
  product: 7_000,
  auth: 10_000,
  payment: 15_000,
  background: 30_000,
} as const;

export type StatusOrigin = 'live' | 'cache' | 'demo' | 'local' | 'offline';

export interface DegradationResult<T> {
  data: T;
  origin: StatusOrigin;
  degraded: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export interface FallbackOptions<T> {
  cacheDurationMs?: number;
  demoDataTimeoutMs?: number;
  apiTimeoutMs?: number;
  circuitBreakerKey?: string;
  circuitBreakerFailureThreshold?: number;
  circuitBreakerTimeoutMs?: number;
  localDataProvider?: () => T | Promise<T>;
  offlineDataProvider?: () => T | Promise<T>;
  isOffline?: boolean;
}

export enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export class RequestTimeoutError extends Error {
  constructor() {
    super('The request exceeded its allowed time.');
    this.name = 'RequestTimeoutError';
  }
}

export class CircuitOpenError extends Error {
  constructor() {
    super('The service is temporarily unavailable.');
    this.name = 'CircuitOpenError';
  }
}

/** Apply a deadline and abort signal to an asynchronous operation. */
export async function withTimeout<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
): Promise<T> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new RangeError('timeoutMs must be a positive finite number.');
  }

  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      Promise.resolve().then(() => operation(controller.signal)),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(new RequestTimeoutError());
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

/** Prevents repeated calls to a failing provider and permits one half-open probe. */
export class CircuitBreaker {
  private state = CircuitBreakerState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;
  private halfOpenProbeActive = false;

  constructor(
    private failureThreshold = 5,
    private resetTimeoutMs = 60_000,
    private readonly onStateChange: (state: CircuitBreakerState) => void = () => undefined,
  ) {
    if (failureThreshold < 1 || resetTimeoutMs < 0) {
      throw new RangeError('Circuit-breaker limits are invalid.');
    }
  }

  configure(failureThreshold: number, resetTimeoutMs: number): void {
    if (failureThreshold < 1 || resetTimeoutMs < 0) return;
    this.failureThreshold = failureThreshold;
    this.resetTimeoutMs = resetTimeoutMs;
  }

  async call<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (Date.now() - this.lastFailureTime < this.resetTimeoutMs) {
        throw new CircuitOpenError();
      }
      this.setState(CircuitBreakerState.HALF_OPEN);
    }

    if (this.state === CircuitBreakerState.HALF_OPEN && this.halfOpenProbeActive) {
      throw new CircuitOpenError();
    }

    if (this.state === CircuitBreakerState.HALF_OPEN) this.halfOpenProbeActive = true;

    try {
      const result = await operation();
      this.failureCount = 0;
      if (this.state !== CircuitBreakerState.CLOSED) {
        this.setState(CircuitBreakerState.CLOSED);
      }
      return result;
    } catch (error) {
      this.failureCount += 1;
      this.lastFailureTime = Date.now();
      if (
        this.state === CircuitBreakerState.HALF_OPEN ||
        this.failureCount >= this.failureThreshold
      ) {
        this.setState(CircuitBreakerState.OPEN);
      }
      throw error;
    } finally {
      this.halfOpenProbeActive = false;
    }
  }

  getState(): CircuitBreakerState {
    return this.state;
  }

  private setState(nextState: CircuitBreakerState): void {
    if (this.state === nextState) return;
    this.state = nextState;
    this.onStateChange(nextState);
  }
}

const circuitBreakers = new Map<string, CircuitBreaker>();
const responseCache = new Map<string, CacheEntry<unknown>>();

function getCircuitBreaker(
  key: string,
  failureThreshold: number,
  resetTimeoutMs: number,
): CircuitBreaker {
  const existing = circuitBreakers.get(key);
  if (existing) {
    existing.configure(failureThreshold, resetTimeoutMs);
    return existing;
  }

  const created = new CircuitBreaker(failureThreshold, resetTimeoutMs);
  circuitBreakers.set(key, created);
  return created;
}

/** Clears process-local breaker state; useful after logout and in deterministic tests. */
export function resetCircuitBreakers(): void {
  circuitBreakers.clear();
}

export function resetDegradationState(): void {
  circuitBreakers.clear();
  responseCache.clear();
}

function getCachedData<T>(key: string, maxAgeMs: number): T | null {
  const cached = responseCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > maxAgeMs) {
    responseCache.delete(key);
    return null;
  }
  return cached.data as T;
}

function setCachedData<T>(key: string, data: T): void {
  responseCache.set(key, { data, timestamp: Date.now() });
}

function isBrowserOffline(explicitValue?: boolean): boolean {
  if (explicitValue !== undefined) return explicitValue;
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}

async function resolveProvider<T>(
  provider: () => T | Promise<T>,
  origin: Exclude<StatusOrigin, 'live' | 'cache'>,
  timeoutMs: number,
): Promise<DegradationResult<T> | null> {
  try {
    const data = await withTimeout(() => Promise.resolve(provider()), timeoutMs);
    return { data, origin, degraded: true };
  } catch {
    return null;
  }
}

/**
 * Resolve data in a deterministic order: live, cache, local, demo, offline.
 * Raw provider errors are intentionally not logged or rethrown because they can
 * contain request URLs, identifiers, or authorization metadata.
 */
export async function withFallback<T>(
  apiCall: (signal: AbortSignal) => Promise<T>,
  cacheKey: string,
  demoDataProvider: () => T | Promise<T>,
  options: FallbackOptions<T> = {},
): Promise<DegradationResult<T>> {
  const {
    cacheDurationMs = 24 * 60 * 60 * 1000,
    demoDataTimeoutMs = REQUEST_TIMEOUT_MS.product,
    apiTimeoutMs = REQUEST_TIMEOUT_MS.product,
    circuitBreakerKey = cacheKey,
    circuitBreakerFailureThreshold = 5,
    circuitBreakerTimeoutMs = 60_000,
    localDataProvider,
    offlineDataProvider,
    isOffline,
  } = options;

  if (!isBrowserOffline(isOffline)) {
    try {
      const breaker = getCircuitBreaker(
        circuitBreakerKey,
        circuitBreakerFailureThreshold,
        circuitBreakerTimeoutMs,
      );
      const data = await breaker.call(() => withTimeout(apiCall, apiTimeoutMs));
      setCachedData(cacheKey, data);
      return { data, origin: 'live', degraded: false };
    } catch {
      // Continue through trusted local fallbacks.
    }
  }

  const cached = getCachedData<T>(cacheKey, cacheDurationMs);
  if (cached !== null) return { data: cached, origin: 'cache', degraded: true };

  if (localDataProvider) {
    const local = await resolveProvider(localDataProvider, 'local', demoDataTimeoutMs);
    if (local) return local;
  }

  const demo = await resolveProvider(demoDataProvider, 'demo', demoDataTimeoutMs);
  if (demo) return demo;

  if (offlineDataProvider) {
    const offline = await resolveProvider(offlineDataProvider, 'offline', demoDataTimeoutMs);
    if (offline) return offline;
  }

  throw new APIError(503, 'Content is temporarily unavailable. Please retry.');
}
