# EUshop Resilience, Health Probes & Failure-Safe Timeout Architecture

**Frameworks:** Resilience4j, Spring Boot Actuator, Bucket4j  

---

## 1. Resilience Patterns

- **Stripe API Client**: Retries up to 3 times with exponential backoff (initial delay 500ms). Timeout set to 3,000ms.
- **Actuator Health Probes**: Liveness probe (`/actuator/health/liveness`) and Readiness probe (`/actuator/health/readiness`) exposed on port 3001.
- **API Rate Limiting**: Limit unauthenticated endpoints to 100 requests / minute per IP address.
