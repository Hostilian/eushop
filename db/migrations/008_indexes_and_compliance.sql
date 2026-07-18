-- Migration: 008_indexes_and_compliance.sql
-- Created at: 2026-07-11
-- Description: Purely-additive FK-backing indexes and JSONB (dietary/allergen) GIN indexes.
--              Postgres does NOT auto-create indexes for FK columns, so every FK below was
--              unindexed after migrations 001-007. All statements are idempotent (IF NOT EXISTS)
--              and additive (no column/table drops, no constraint changes). Plain CREATE INDEX
--              is used (not CONCURRENTLY) to stay transaction-safe and match 005/006 conventions,
--              for very large tables in prod, run the same statements as CONCURRENTLY outside a txn.
--
--              SCOPE NOTE: this targets the schema produced by db/migrations 001-007 (the DB of
--              record, since spring.jpa.hibernate.ddl-auto=none). Several JPA entities disagree
--              with these column names (see the audit report / entity-vs-migration drift). This
--              migration deliberately indexes ONLY columns that provably exist in 001-007 and
--              invents no schema. See the flagged items in the audit for the drift and GDPR gaps.

-- ── Missing foreign-key indexes ──────────────────────────────────────────────

-- orders.food_id FK -> foods(id) was never indexed (001 created buyer_id/seller_id/status only).
-- Speeds "orders for a food" lookups and the FK integrity check on foods delete/update.
CREATE INDEX IF NOT EXISTS idx_orders_food_id ON orders(food_id);

-- reviews.order_id FK -> orders(id) was never indexed. Needed to link a review to its order
-- (verified-purchase gating) and to avoid a seq-scan on the FK integrity check when orders change.
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews(order_id);

-- conversations.buyer_id FK -> users(id) was never indexed (conversations got no indexes at all in 001).
-- Required for "conversations for a user" queries and the FK check on user anonymisation/delete.
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON conversations(buyer_id);

-- conversations.seller_id FK -> users(id) was never indexed. Same rationale as buyer_id.
CREATE INDEX IF NOT EXISTS idx_conversations_seller_id ON conversations(seller_id);

-- ── Missing JSONB GIN indexes (dietary / allergen filtering) ─────────────────

-- foods.dietary_restrictions JSONB (e.g. ["Vegan","Gluten-Free"]) had no GIN index, 006 only
-- indexed the name/description text columns. jsonb_path_ops supports fast @> containment filters.
CREATE INDEX IF NOT EXISTS idx_foods_dietary_restrictions_gin ON foods USING gin (dietary_restrictions jsonb_path_ops);

-- foods.allergens JSONB (e.g. ["Nuts","Gluten"]) had no GIN index. Allergen exclusion is a safety
-- filter, not just a nicety, so containment queries must not seq-scan the foods table.
CREATE INDEX IF NOT EXISTS idx_foods_allergens_gin ON foods USING gin (allergens jsonb_path_ops);

-- food_requests.dietary_needs JSONB (buyer-side dietary needs) had no GIN index. Used to match
-- open requests against seller listings by dietary tag, jsonb_path_ops for @> containment.
CREATE INDEX IF NOT EXISTS idx_food_requests_dietary_needs_gin ON food_requests USING gin (dietary_needs jsonb_path_ops);

COMMENT ON INDEX idx_orders_food_id IS 'Backs orders.food_id FK -> foods(id). Postgres does not auto-index FKs.';
COMMENT ON INDEX idx_reviews_order_id IS 'Backs reviews.order_id FK -> orders(id). Supports verified-purchase linkage.';
COMMENT ON INDEX idx_conversations_buyer_id IS 'Backs conversations.buyer_id FK -> users(id).';
COMMENT ON INDEX idx_conversations_seller_id IS 'Backs conversations.seller_id FK -> users(id).';
COMMENT ON INDEX idx_foods_dietary_restrictions_gin IS 'GIN (jsonb_path_ops) for @> containment filters on dietary tags.';
COMMENT ON INDEX idx_foods_allergens_gin IS 'GIN (jsonb_path_ops) for @> containment filters on allergen exclusion (safety filter).';
COMMENT ON INDEX idx_food_requests_dietary_needs_gin IS 'GIN (jsonb_path_ops) for @> matching of buyer dietary needs to listings.';
