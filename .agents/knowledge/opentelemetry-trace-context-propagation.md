# OpenTelemetry Trace Context Propagation

## Overview
EUshop uses OpenTelemetry for distributed tracing across Spring Boot API, Next.js frontend, and OpenSearch.

## W3C Trace Context Headers
```
traceparent: 00-{trace-id}-{span-id}-{flags}
tracestate: eushop=vendor-specific-data
```

## Spring Boot Configuration
```yaml
# application.yml
spring:
  application:
    name: core-service
management:
  tracing:
    sampling:
      probability: 1.0
```

## Correlation ID Pattern
Every HTTP request gets a correlation ID:
```java
@Component
public class CorrelationIdFilter extends OncePerRequestFilter {
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) {
        String correlationId = Optional.ofNullable(req.getHeader("X-Correlation-ID"))
            .orElse(UUID.randomUUID().toString());
        MDC.put("correlationId", correlationId);
        res.setHeader("X-Correlation-ID", correlationId);
        chain.doFilter(req, res);
    }
}
```

## Alert Thresholds
- Span latency > 200ms → alert
- Error rate > 0.1% → alert
- Trace sampling: 100% in dev, 10% in prod
