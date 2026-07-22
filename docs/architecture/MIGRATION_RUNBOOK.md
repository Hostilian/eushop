# EUshop Flyway Migration Discipline & Rollback Runbook

**Database Engine:** PostgreSQL 15+ (Port 5432)  
**Migration Framework:** Flyway Versioned Migrations (`db/migrations/`)  

---

## 1. Migration Discipline Rules

- **Immutable Version Numbers**: Applied migrations (`V1__...`, `V2__...`, `V3__...`) MUST never be modified.
- **Explicit Index Constraints**: All foreign keys and query filters (`seller_id`, `created_at`, `status`) MUST include explicit indexes.
- **Rollback Strategy**: Every versioned migration file MUST have a corresponding rollback runbook documenting inverse SQL DDL commands.

---

## 2. Emergency Rollback Procedure

If a migration fails in staging or production:
1. Identify the failed version (`SELECT version, success FROM flyway_schema_history;`).
2. Run repair tool: `./mvnw flyway:repair`.
3. Execute rollback DDL script manually before re-deploying.
