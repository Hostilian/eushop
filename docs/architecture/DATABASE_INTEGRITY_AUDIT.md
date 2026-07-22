# EUshop Database Migration Verification & Integrity Audit

**Target Database:** PostgreSQL 15+  
**Schema Migration Engine:** Flyway (`db/migrations/`)  

---

## 1. Schema Safety Verification Matrix

- **Foreign Key Indexing**: All foreign key columns (`seller_id`, `food_id`, `order_id`, `user_id`) possess explicit GIN/B-Tree indexes.
- **Monetary Precision**: All monetary columns (`price`, `finder_fee`, `total_amount`, `vat_amount`) use `NUMERIC(12,2)` / `DECIMAL(12,2)`.
- **Timestamps**: All tables track UTC `created_at` and `updated_at` timestamps using PostgreSQL `@PrePersist` and `@PreUpdate` triggers.
