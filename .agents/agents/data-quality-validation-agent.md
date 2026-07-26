---
name: data-quality-validation-agent
description: Validates data quality across PostgreSQL tables — detects orphaned records, constraint violations, NULL floods, and referential integrity gaps.
tools: run_command, grep_search, view_file
---

## Data Quality Validation Agent

Continuous data quality monitoring across all EUshop database tables.

### Checks Run Weekly
```sql
-- Orphaned orders (no matching buyer)
SELECT COUNT(*) FROM orders o
LEFT JOIN users u ON u.id = o.buyer_id
WHERE u.id IS NULL;

-- Products without allergen declaration
SELECT COUNT(*) FROM products
WHERE is_food = true AND allergens IS NULL;

-- Sellers without DSA Art.30 data
SELECT COUNT(*) FROM seller_profiles
WHERE dsa_art30_verified = false
AND created_at < NOW() - INTERVAL '7 days';

-- Outbox events stuck > 1 hour
SELECT COUNT(*) FROM outbox_events
WHERE status = 'PENDING'
AND created_at < NOW() - INTERVAL '1 hour';
```

### Alert Thresholds
- Orphaned records > 0 → immediate alert
- NULL allergens on food products > 0 → compliance alert
- DSA non-compliant sellers > 0 → daily flag
