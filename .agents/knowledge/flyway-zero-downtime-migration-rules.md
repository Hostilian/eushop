# Flyway Zero-Downtime Migration Rules

## Overview
All Flyway migrations in `db/migrations/` MUST be zero-downtime compatible. These rules are non-negotiable.

## Allowed Operations
- `CREATE TABLE` — safe
- `ADD COLUMN` with default value — safe in PostgreSQL 11+
- `CREATE INDEX CONCURRENTLY` — safe (non-blocking)
- `CREATE UNIQUE INDEX CONCURRENTLY` — safe
- `ALTER TABLE ADD CONSTRAINT ... NOT VALID` — safe (deferred validation)

## FORBIDDEN Operations (will block production)
- `DROP TABLE` — NEVER in a migration
- `DROP COLUMN` — use multi-phase: deprecate → remove in next release
- `ALTER TABLE ADD COLUMN NOT NULL` without default — locks table
- `TRUNCATE` — NEVER
- `CREATE INDEX` (without CONCURRENTLY) — full table lock

## Version Numbering
```
V001__create_users.sql
V002__add_seller_profiles.sql
V003__create_index_concurrently_products_name.sql
```
No gaps. No repeats. Sequential only.

## Source Files
- `db/migrations/`
- `services/core-service/src/main/resources/db/migration/`
