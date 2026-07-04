-- Migration: 004_dac7_reporting.sql
-- Created at: 2026-07-04
-- Description: DAC7 annual reporting snapshot table and analytics instrumentation fields

-- DAC7 requires EU marketplaces to report seller transaction summaries to tax authorities annually.
-- This table stores the point-in-time snapshot for each seller per reporting year.
-- ⚠️ Founder note: the reporting thresholds and filing process require sign-off from a tax advisor.
CREATE TABLE IF NOT EXISTS dac7_annual_snapshot (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id             UUID NOT NULL REFERENCES users(id),
  reporting_year        SMALLINT NOT NULL,           -- e.g. 2026
  total_consideration   NUMERIC(12, 2) NOT NULL,     -- gross amount received by seller (EUR)
  transaction_count     INTEGER NOT NULL,             -- number of completed orders
  platform_fee_total    NUMERIC(12, 2) NOT NULL,      -- total platform fees withheld
  seller_payout_total   NUMERIC(12, 2) NOT NULL,      -- net paid out to seller
  submitted_at          TIMESTAMPTZ,                  -- NULL until reported to tax authority
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(seller_id, reporting_year)
);

CREATE INDEX IF NOT EXISTS idx_dac7_seller_year ON dac7_annual_snapshot(seller_id, reporting_year);
CREATE INDEX IF NOT EXISTS idx_dac7_submitted   ON dac7_annual_snapshot(submitted_at);

COMMENT ON TABLE dac7_annual_snapshot IS
  'Annual DAC7 reporting snapshots. One row per seller per calendar year. submitted_at is NULL until the report is filed with the tax authority.';

-- Analytics instrumentation: capture acquisition channel and source for CAC/LTV calculations.
ALTER TABLE users ADD COLUMN IF NOT EXISTS acquisition_channel VARCHAR(50);   -- 'organic', 'referral', 'paid'
ALTER TABLE users ADD COLUMN IF NOT EXISTS acquisition_source  VARCHAR(100);  -- UTM source value

-- Store platform economics on each order for LTV/take-rate dashboards.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS platform_fee_eur  NUMERIC(10, 2);  -- amount kept by platform
ALTER TABLE orders ADD COLUMN IF NOT EXISTS seller_payout_eur NUMERIC(10, 2);  -- net seller payout

CREATE INDEX IF NOT EXISTS idx_orders_platform_fee ON orders(platform_fee_eur);
