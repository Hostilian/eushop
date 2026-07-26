# V244 Schema Request — Server-Authoritative Marketplace Checkout

Status: APPROVED FOR ADDITIVE IMPLEMENTATION  
Requested: 2026-07-26  
Target migration: `V244__expand_marketplace_checkout_aggregate.sql`

## Problem

The V243 tables model `marketplace_orders`, `seller_orders`, and `order_lines`,
but the schema cannot safely support the required payment sequence:

- `marketplace_orders.stripe_payment_intent_id` is `NOT NULL`, so an aggregate
  cannot be persisted before the external Stripe call.
- No idempotency key or explicit payment state is stored.
- Aggregate VAT, shipping, platform-fee, payout, and refund snapshots are
  incomplete.
- `MarketplaceLedgerEntry` exists in Java without a database migration.
- `order_lines` cannot reference the current `foods` listing without
  misrepresenting it as a canonical producer product.

The legacy browser flow also creates payment before order persistence and
trusts client-supplied totals. V244 supplies the expand-only database structure
needed to reverse that sequence.

## Additive changes

- Make PaymentIntent attachment nullable during aggregate preparation.
- Add marketplace idempotency, status, destination, shipping-address, monetary
  snapshot, and update-time columns.
- Add seller fee, payout, refund, and transfer-reference snapshots.
- Add a current-listing `food_id` to order lines and allow future canonical
  offer/product links to remain null.
- Add the immutable marketplace ledger table and explicit indexes.
- Add named `NOT VALID` non-negative amount constraints, then validate them.

No existing table, column, or historical row is dropped.

## Privacy and compliance impact

- `shipping_address` is order PII. GDPR Art. 17 erasure must clear it, and Art.
  20 portability must include it while the user account is active.
- Monetary and ledger records may need statutory retention even after account
  erasure; user-facing PII must be removed while financial evidence is retained.
- VAT and payout fields are structural calculation snapshots only.

// COMPLIANCE-REVIEW: A qualified tax advisor must confirm VAT treatment,
invoice rounding, shipping tax treatment, platform-fee treatment, and seller
payout allocation before production launch.

## Rollback posture

This is an expand migration. Rollback is application-level: stop writing the
new columns/tables. Physical removal is intentionally deferred to a separately
reviewed contract migration after the old application version is retired.
