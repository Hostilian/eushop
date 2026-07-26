---
name: eushop-rate-limiting-skill
description: API Rate Limiting & Throttle Configuration Skill for EUshop — implements per-IP, per-user, and per-seller rate limits on Spring Boot endpoints.
---

# API Rate Limiting Configuration

This skill configures and enforces rate limiting across EUshop API endpoints.

## Spring Boot Rate Limit Implementation (Bucket4j)
```java
@Component
public class RateLimitFilter extends OncePerRequestFilter {
    private final Cache<String, Bucket> cache = Caffeine.newBuilder()
        .maximumSize(10_000).expireAfterAccess(1, HOURS).build();

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) {
        String key = extractRateLimitKey(req); // IP + user ID
        Bucket bucket = cache.get(key, k -> createBucket());
        if (bucket.tryConsume(1)) {
            chain.doFilter(req, res);
        } else {
            res.setStatus(429);
            res.setHeader("Retry-After", "60");
        }
    }

    private Bucket createBucket() {
        return Bucket.builder()
            .addLimit(limit -> limit.capacity(100).refillGreedy(100, Duration.ofMinutes(1)))
            .build();
    }
}
```

## Rate Limit Tiers
- Anonymous: 20 req/min
- Authenticated buyer: 100 req/min
- Seller API: 50 req/min
- Search endpoint: 30 req/min (OpenSearch cost)
- Checkout: 5 req/min (fraud prevention)

## Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1722000000
Retry-After: 60  (on 429 only)
```
