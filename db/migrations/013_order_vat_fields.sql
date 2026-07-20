-- Migration: 013_order_vat_fields.sql
-- Created at: 2026-07-19
-- Description: Persist the VAT rate and amount shown at checkout on each order.

ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS vat_rate NUMERIC(5, 4) NULL,
    ADD COLUMN IF NOT EXISTS vat_amount_eur NUMERIC(12, 2) NULL;

-- Existing orders and pre-checkout quick-add records remain nullable because
-- they were created without a confirmed destination-country tax calculation.
-- COMPLIANCE-REVIEW: These fields capture the checkout calculation structure;
-- a tax advisor must confirm product classification, invoice rounding, and
-- retention requirements before they are used for production tax reporting.

-- Rollback is intentionally forward-only: removing tax audit data should use a
-- reviewed follow-up migration after the retained values have been exported.
