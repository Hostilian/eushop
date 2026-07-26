---
name: eushop-postgres-query-optimisation
description: PostgreSQL Query Optimisation Skill — EXPLAIN ANALYZE interpretation, index strategy, slow query tuning, and VACUUM/ANALYZE scheduling for EUshop.
---

# PostgreSQL Query Optimisation

## EXPLAIN ANALYZE Interpretation
```sql
-- Always use EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM products
WHERE is_food = true
AND 'gluten' = ANY(allergens)
ORDER BY created_at DESC
LIMIT 20;
```

### Key Metrics to Check
- **Seq Scan on large table** → Add index
- **Nested Loop with large outer set** → Consider Hash Join
- **Buffers: hit** vs **read** → Low read ratio = good cache hit
- **actual rows** >> **estimated rows** → Stale statistics, run ANALYZE

## Index Strategy for EUshop
```sql
-- Product search patterns
CREATE INDEX CONCURRENTLY idx_products_is_food ON products(is_food) WHERE is_food = true;
CREATE INDEX CONCURRENTLY idx_products_allergens ON products USING GIN(allergens);
CREATE INDEX CONCURRENTLY idx_products_origin_geo ON products USING GIST(origin_geometry);
CREATE INDEX CONCURRENTLY idx_products_seller_status ON products(seller_id, status);
CREATE INDEX CONCURRENTLY idx_orders_buyer_created ON orders(buyer_id, created_at DESC);
CREATE INDEX CONCURRENTLY idx_outbox_pending ON outbox_events(created_at) WHERE status = 'PENDING';
```

## VACUUM & ANALYZE Schedule
```sql
-- Check table bloat
SELECT schemaname, tablename, n_dead_tup, n_live_tup,
       round(n_dead_tup::numeric/nullif(n_live_tup,0)*100, 2) AS dead_ratio
FROM pg_stat_user_tables ORDER BY dead_ratio DESC NULLS LAST;

-- Manual VACUUM if autovacuum is behind
VACUUM (ANALYZE, VERBOSE) products;
```

## Connection Pool Monitoring
See: `spring-boot-connection-pool-tuning.md`
