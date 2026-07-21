// COMPLIANCE-REVIEW: DDoS & API Rate Limiting Middleware
// Enforces request throttling per IP / Client token without tracking PII.

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

const requestCounts = new Map<string, { count: number; windowStart: number }>();

/**
 * Evaluates rate limit for a client identifier.
 */
export function checkRateLimit(clientId: string, maxRequests: number = 100, windowSeconds: number = 60): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const current = requestCounts.get(clientId);

  if (!current || (now - current.windowStart) > windowMs) {
    requestCounts.set(clientId, { count: 1, windowStart: now });
    return {
      allowed: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetSeconds: windowSeconds,
    };
  }

  if (current.count >= maxRequests) {
    const timePassed = Math.floor((now - current.windowStart) / 1000);
    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      resetSeconds: windowSeconds - timePassed,
    };
  }

  current.count += 1;
  const timePassed = Math.floor((now - current.windowStart) / 1000);
  return {
    allowed: true,
    limit: maxRequests,
    remaining: maxRequests - current.count,
    resetSeconds: windowSeconds - timePassed,
  };
}
