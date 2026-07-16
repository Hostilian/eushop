# Backend commerce batch report

Date: 2026-07-16

## Completed

- Fixed combined product filtering in `FoodService`: `q`, `country`, and `category` are now applied together.
- Replaced unsafe JSON string construction in the allergen exclusion query with PostgreSQL `jsonb_build_array`.
- Added bounded pagination validation and consistent API validation errors.
- Added `CreateOrderRequest`, so callers cannot submit a seller, price, fee, or status. The service derives these from the current food record and rejects unavailable, insufficient-stock, and self-purchase requests.
- Restricted fulfilment status updates to the seller. A newly created order remains `PENDING`; this does not represent successful payment.
- Added focused service and MockMvc regression tests for combined filters, unavailable order creation, and invalid pagination.

## Validation

- `services/core-service/mvnw.cmd test` was started twice. It did not reach compilation or tests within the 60-second command limit because the fresh Maven cache was downloading dependencies slowly (including `hibernate-core`). This is a tooling/network limitation, not a pass.
- Static review found the test mocks updated for the new service contract.

## Graceful degradation

- Invalid request parameters return an actionable 400 response instead of exposing framework exceptions.
- An unavailable listing prevents only that order creation; public browsing remains unaffected.
- No payment success is emitted during order creation. Confirmation remains reserved for the signed webhook flow.

## Unresolved risks

- **High:** the migration history and both legacy SQL seed files are materially inconsistent with the JPA entities. For example, `001_initial_schema.sql` uses `is_active`, `quantity_available`, and `finder_fee_amount`, whereas `Food` maps `available`, `quantity`, and `finder_fee`; `002_compliance_fields.sql` also updates a JSONB allergen column with an invalid empty string. This can prevent a clean local database from reaching a usable product-data state. Repair requires a dedicated, reviewed migration-baseline workstream; shipped migrations were not rewritten in this batch.
- **High:** two distinct `009_*` migration filenames exist. The Node migration runner sorts and reapplies files without a migration ledger, so it is not a safe production migration mechanism.
- **COMPLIANCE-REVIEW:** stock reservation and tax/VAT calculation are not implemented in order creation. The server derives product price, but tax treatment and inventory concurrency need legal and transactional design review before launch.

## Likely merge conflicts

- `CHANGELOG.md`
- `FoodController.java`, `FoodService.java`, `FoodRepository.java`, `OrderController.java`, and `OrderService.java` if parallel backend work changed the same API contracts.
