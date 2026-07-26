# Auth0 JWT Fail-Closed Filter Pattern

## Overview
EUshop uses Auth0 for authentication with a fail-closed JWT filter on all Spring Boot API endpoints.

## Fail-Closed Principle
If JWT validation fails for ANY reason (malformed, expired, wrong audience), the request MUST be rejected with 401. Never fall through to a default-permit state.

## Implementation Pattern
```java
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) {
        try {
            String token = extractBearerToken(req);
            if (token == null) { res.sendError(401); return; }
            Jwt jwt = jwtDecoder.decode(token); // throws if invalid
            SecurityContextHolder.getContext().setAuthentication(
                new JwtAuthenticationToken(jwt)
            );
            chain.doFilter(req, res);
        } catch (JwtException e) {
            res.sendError(401); // FAIL CLOSED — never permit on error
        }
    }
}
```

## Key Configuration
- Audience: `https://api.eushop.eu`
- Issuer: `https://eushop.eu.auth0.com/`
- Algorithm: RS256

// COMPLIANCE-REVIEW: GDPR Art. 5(1)(f) — security of processing
