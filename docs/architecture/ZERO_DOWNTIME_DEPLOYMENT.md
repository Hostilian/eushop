# EUshop Zero-Downtime Deployment Strategy & Expand-Contract Pattern

**Target Architecture:** Zero-downtime rolling updates across PostgreSQL & Spring Boot microservices  
**Compliance & Data Safety:** Zero loss of active transaction data or state transitions  

---

## 1. Expand-and-Contract Database Migrations

When altering or renaming database columns/tables:
1. **Phase A (Expand)**: Add the new column/table in Flyway migration (`V{N}__expand.sql`) alongside the old structure. Code writes to both old and new columns.
2. **Phase B (Backfill & Sync)**: Execute background data sync script populating existing rows.
3. **Phase C (Contract)**: After full code deployment across all application nodes, drop the old column/table in subsequent migration (`V{N+1}__contract.sql`).

---

## 2. Pre-Deployment Health & Safety Gates

Before any production deployment:
- **Flyway Checksum Precheck**: Verify applied migration checksums match baseline.
- **Canary Traffic Gating**: Direct 5% of traffic to canary instance, verifying zero HTTP 5xx errors for 3 minutes before full rollout.
