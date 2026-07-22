-- Migration: 005_food_rating_materialized_view.sql
-- Created at: 2026-07-04
-- Description: Materialized view for fast food rating aggregates + verified-purchase review gate

-- Add verified_purchase flag to reviews.
-- Only orders with status='DELIVERED' for the matching buyer/food pair qualify.
-- This prevents fake reviews and satisfies the DSA "trusted review" requirement (Recital 62).
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS verified_purchase BOOLEAN NOT NULL DEFAULT FALSE;

<<<<<<< HEAD
CREATE INDEX IF NOT EXISTS idx_reviews_verified_purchase_food ON reviews(verified_purchase, food_id);
=======
CREATE INDEX IF NOT EXISTS idx_reviews_verified_purchase ON reviews(verified_purchase, food_id);
>>>>>>> pull-1

-- Materialized view for fast listing-page rating display.
-- Refreshed via Spring Application Event on every new review save.
-- Use REFRESH MATERIALIZED VIEW CONCURRENTLY food_rating_summary in the background job.
CREATE MATERIALIZED VIEW IF NOT EXISTS food_rating_summary AS
  SELECT
    food_id,
    ROUND(AVG(rating)::NUMERIC, 2)     AS avg_rating,
    COUNT(*)                           AS review_count,
    COUNT(*) FILTER (WHERE verified_purchase = TRUE) AS verified_review_count
  FROM reviews
  GROUP BY food_id;

CREATE UNIQUE INDEX IF NOT EXISTS uq_food_rating_summary_food_id ON food_rating_summary(food_id);

COMMENT ON MATERIALIZED VIEW food_rating_summary IS
  'Pre-aggregated rating stats per food item. Refresh concurrently via scheduled Spring event after each review insert.';
COMMENT ON COLUMN reviews.verified_purchase IS
  'True if the reviewer has a DELIVERED order for this food item. Required for DSA-compliant trusted review labelling.';
