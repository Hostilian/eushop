# V245 Marketplace Refund Requests

## Purpose

Persist each server-authoritative partial or full refund before calling Stripe,
reserve its amount against concurrent requests, and reconcile the final state
only from a signed provider webhook.

## Tables and columns

- New table `marketplace_refunds`.
- `id VARCHAR(64)` primary key.
- `marketplace_order_id VARCHAR(64)` and `seller_order_id VARCHAR(64)` identify
  the aggregate and seller allocation.
- `actor_id VARCHAR(64)` records the seller or administrator who requested it.
- `amount_cents BIGINT`, `currency VARCHAR(3)`, and `reason VARCHAR(500)` retain
  the immutable request snapshot.
- `idempotency_key VARCHAR(128)` and nullable
  `stripe_refund_id VARCHAR(255)` provide local/provider deduplication.
- `status VARCHAR(32)`, `failure_reason VARCHAR(500)`, `created_at`, and
  `updated_at` retain lifecycle state.

## Constraints and indexes

- Foreign keys reference `marketplace_orders`, `seller_orders`, and `users`.
- Refund amount must be positive and currency is restricted to `EUR` for the
  current launch wedge.
- Idempotency key and provider refund ID are unique.
- Index seller-order history and pending lifecycle queries.

## Backfill and compatibility

No backfill is required. The table is additive and existing marketplace orders
remain readable. Application code must tolerate no refund rows.

## Lock and downtime analysis

Creating an empty table and its indexes does not rewrite existing order tables.
Foreign-key validation briefly inspects catalog metadata only. No table or
column rename is included.

## Rollback

Disable refund request creation first. The table can remain inert during a
rollback; dropping financial history requires explicit accounting/legal review
and is not part of an automated rollback.

<!-- COMPLIANCE-REVIEW: Refund allocation, VAT correction documents, ledger
retention, and seller settlement reversal require qualified tax/accounting/legal
sign-off before production use. -->
