---
name: flyway-zero-downtime-migrations
description: Lock-free SQL migration discipline & zero-downtime schema evolution (flyway-community). Additive column changes, non-blocking index creation, and sequential version tracking.
---

# Flyway Zero-Downtime Migration Discipline

This skill implements Flyway relational database migration rules.

## Rules
1. **Never Modify Shipped Migrations**: Always create sequential SQL migration scripts (`V244__...sql`).
2. **Additive Columns**: Add new columns as NULLable or with safe default values to avoid table locks.
3. **Concurrently Created Indexes**: Use non-blocking index creation in production setups.
