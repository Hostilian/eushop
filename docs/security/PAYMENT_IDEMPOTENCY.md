# EUshop Server-Authoritative Stripe Payment Engine & Idempotency Audit

**Compliance Authority:** `WebhookController.java` & `OrderService.java`  
**Security Standard:** Server-Authoritative Payment Calculations & Webhook Deduplication  

---

## 1. Security Architecture Controls

- **Zero Client Price Manipulation**: Final order total is strictly computed on the backend (port 3001) using `Money.java` (`BigDecimal`). The client never submits order totals.
- **Stripe Webhook Signature**: `Stripe-Signature` header is verified against `STRIPE_WEBHOOK_SECRET` before processing. Fail-closed in production (`spring.profiles.active=prod`).
- **Idempotency Guarantee**: `WebhookController.java` deduplicates incoming Stripe event UUIDs against PostgreSQL `orders` table to prevent double-charging or duplicate order updates.
