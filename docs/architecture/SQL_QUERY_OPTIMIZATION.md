# EUshop SQL Query Plan Optimization & Indexing Strategy

**Target SLA:** Sub-20ms P95 query latency across all read paths  
**Database Engine:** PostgreSQL 15+  

---

## 1. Indexing & Query Plan Tuning Matrix

| Query Path | Target Table | Index Type | Query Optimization Pattern |
| :--- | :--- | :--- | :--- |
| **Catalog Search** | `foods` | `GIN (name gin_trgm_ops, description gin_trgm_ops)` | Fuzzy trigram ILIKE matching |
| **Seller Dashboard** | `foods`, `orders` | `B-Tree (seller_id, status)` | Composite index preventing full table scans |
| **DAC7 Reporting** | `orders`, `users` | `B-Tree (created_at, status)` | Range scan filtering by calendar year |
| **Order History** | `orders` | `B-Tree (buyer_id, created_at DESC)` | Sorted pagination scan |

---

## 2. EXPLAIN ANALYZE Verification

All repository queries have been verified to execute index scans with zero sequential table scans on datasets over 1,000 rows.
