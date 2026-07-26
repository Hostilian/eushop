# Security Headers & CSP Configuration

## Overview
EUshop enforces strict security headers on all HTTP responses.

## Required HTTP Security Headers
```
Content-Security-Policy: default-src 'self'; script-src 'self' https://js.stripe.com; frame-src https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com https://*.auth0.com
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(self)
```

## Next.js Configuration
```javascript
// next.config.js
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // ... full list above
];
module.exports = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  }
};
```

## Spring Boot Configuration
```java
http.headers(headers -> headers
    .frameOptions(HeadersConfigurer.FrameOptionsConfig::deny)
    .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'..."))
);
```

// COMPLIANCE-REVIEW: Review CSP against Stripe.js requirements before any payment flow changes
