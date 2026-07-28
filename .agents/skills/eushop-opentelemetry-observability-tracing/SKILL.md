---
name: eushop-opentelemetry-observability-tracing
description: Distributed Tracing, Correlation IDs & Observability Standards for EUshop
---

# OpenTelemetry Observability & Distributed Tracing

## Overview
EUshop uses OpenTelemetry (OTel) for distributed tracing, metrics, and structured logging across the Spring Boot core-service and Next.js web app. Correlation IDs must propagate across all requests to enable end-to-end trace reconstruction.

## Correlation ID Propagation

```java
// services/core-service/src/observability/CorrelationIdFilter.java
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorrelationIdFilter implements Filter {
    public static final String CORRELATION_ID_HEADER = "X-Correlation-Id";

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) {
        HttpServletRequest request = (HttpServletRequest) req;
        String correlationId = request.getHeader(CORRELATION_ID_HEADER);
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString();
        }
        MDC.put("correlationId", correlationId);
        ((HttpServletResponse) res).setHeader(CORRELATION_ID_HEADER, correlationId);
        try {
            chain.doFilter(req, res);
        } finally {
            MDC.clear();
        }
    }
}
```

## Structured Log Format (JSON)

```json
{
  "timestamp": "2025-07-27T10:00:00.000Z",
  "level": "INFO",
  "service": "core-service",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "spanId": "00f067aa0ba902b7",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Order created successfully",
  "orderId": "ord-12345",
  "userId": "user-67890"
}
```

## OTel Span Naming Conventions

```java
// Standard span naming: {verb} {resource}
// Examples:
Span span = tracer.spanBuilder("POST /api/orders").startSpan();
Span dbSpan = tracer.spanBuilder("SELECT orders").setSpanKind(SpanKind.CLIENT).startSpan();
Span externalSpan = tracer.spanBuilder("Stripe.paymentIntents.create").setSpanKind(SpanKind.CLIENT).startSpan();
```

## Key Metrics to Instrument

| Metric | Type | Labels |
|--------|------|--------|
| `http.server.request.duration` | Histogram | `http.method`, `http.route`, `http.status_code` |
| `db.client.operation.duration` | Histogram | `db.operation`, `db.sql.table` |
| `order.created.total` | Counter | `currency`, `country` |
| `vat.calculation.errors` | Counter | `country`, `error_type` |
| `stripe.webhook.received` | Counter | `event_type`, `status` |

## Sampling Strategy

```yaml
# otel-collector-config.yaml
processors:
  probabilistic_sampler:
    hash_seed: 22
    sampling_percentage: 10  # Sample 10% in production
  # Always sample:
  filter/always_sample_errors:
    traces:
      span:
        - 'status.code == STATUS_CODE_ERROR'
```

## Source Files
- `services/core-service/src/observability/CorrelationIdFilter.java`
- `services/core-service/src/observability/OtelConfig.java`
- See also: `opentelemetry-trace-context-propagation.md` knowledge item
