---
name: eushop-opentelemetry-observability-tracing
description: Distributed Tracing, Correlation IDs & Observability Standards for EUshop
---

# OpenTelemetry Observability Engine

This skill enforces distributed tracing and correlation ID propagation across all microservices and frontend clients.

## Rules
1. **Correlation IDs**: Propagate `X-Correlation-Id` header on every REST request.
2. **Structured Logs**: Format logs in JSON with timestamp, trace ID, level, and service scope.
