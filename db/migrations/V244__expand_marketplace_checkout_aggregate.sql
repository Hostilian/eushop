-- V244: Expand V243 marketplace checkout for server-authoritative payment flow.
-- This migration is additive. Do not edit the applied V243 migration.

ALTER TABLE marketplace_orders
    ALTER COLUMN stripe_payment_intent_id DROP NOT NULL,
    ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(128),
    ADD COLUMN IF NOT EXISTS status VARCHAR(32) NOT NULL DEFAULT 'PAYMENT_PENDING',
    ADD COLUMN IF NOT EXISTS destination_country_iso2 VARCHAR(2),
    ADD COLUMN IF NOT EXISTS shipping_address TEXT,
    ADD COLUMN IF NOT EXISTS grand_subtotal_cents BIGINT,
    ADD COLUMN IF NOT EXISTS grand_shipping_cents BIGINT,
    ADD COLUMN IF NOT EXISTS grand_vat_cents BIGINT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX IF NOT EXISTS uq_marketplace_orders_idempotency_key
    ON marketplace_orders(idempotency_key)
    WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_marketplace_orders_buyer_created
    ON marketplace_orders(buyer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_marketplace_orders_status
    ON marketplace_orders(status);

ALTER TABLE marketplace_orders
    ADD CONSTRAINT ck_marketplace_orders_amounts_nonnegative
    CHECK (
        grand_total_cents >= 0
        AND (grand_subtotal_cents IS NULL OR grand_subtotal_cents >= 0)
        AND (grand_shipping_cents IS NULL OR grand_shipping_cents >= 0)
        AND (grand_vat_cents IS NULL OR grand_vat_cents >= 0)
    ) NOT VALID;

ALTER TABLE marketplace_orders
    VALIDATE CONSTRAINT ck_marketplace_orders_amounts_nonnegative;

ALTER TABLE seller_orders
    ADD COLUMN IF NOT EXISTS platform_fee_cents BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS seller_payout_cents BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS refunded_amount_cents BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS stripe_transfer_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_seller_orders_seller_status
    ON seller_orders(seller_id, status);

ALTER TABLE seller_orders
    ADD CONSTRAINT ck_seller_orders_amounts_nonnegative
    CHECK (
        subtotal_cents >= 0
        AND shipping_fee_cents >= 0
        AND vat_cents >= 0
        AND total_cents >= 0
        AND platform_fee_cents >= 0
        AND seller_payout_cents >= 0
        AND refunded_amount_cents >= 0
    ) NOT VALID;

ALTER TABLE seller_orders
    VALIDATE CONSTRAINT ck_seller_orders_amounts_nonnegative;

ALTER TABLE order_lines
    ALTER COLUMN offer_id DROP NOT NULL,
    ALTER COLUMN producer_product_id DROP NOT NULL,
    ADD COLUMN IF NOT EXISTS food_id VARCHAR(64),
    ADD COLUMN IF NOT EXISTS product_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS currency VARCHAR(3) NOT NULL DEFAULT 'EUR';

CREATE INDEX IF NOT EXISTS idx_order_lines_food
    ON order_lines(food_id);

CREATE TABLE IF NOT EXISTS marketplace_ledger_entries (
    id VARCHAR(64) PRIMARY KEY,
    marketplace_order_id VARCHAR(64) NOT NULL,
    seller_order_id VARCHAR(64),
    seller_id VARCHAR(64) NOT NULL,
    buyer_id VARCHAR(64) NOT NULL,
    entry_type VARCHAR(32) NOT NULL,
    gross_amount_cents BIGINT NOT NULL,
    net_amount_cents BIGINT NOT NULL,
    vat_amount_cents BIGINT NOT NULL,
    platform_fee_cents BIGINT NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    stripe_payment_intent_id VARCHAR(255),
    idempotency_key VARCHAR(160) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_marketplace_ledger_idempotency UNIQUE (idempotency_key),
    CONSTRAINT ck_marketplace_ledger_amounts_nonnegative CHECK (
        gross_amount_cents >= 0
        AND net_amount_cents >= 0
        AND vat_amount_cents >= 0
        AND platform_fee_cents >= 0
    )
);

CREATE INDEX IF NOT EXISTS idx_marketplace_ledger_marketplace_order
    ON marketplace_ledger_entries(marketplace_order_id);

CREATE INDEX IF NOT EXISTS idx_marketplace_ledger_seller_order
    ON marketplace_ledger_entries(seller_order_id);

CREATE INDEX IF NOT EXISTS idx_marketplace_ledger_seller_created
    ON marketplace_ledger_entries(seller_id, created_at DESC);

-- COMPLIANCE-REVIEW: VAT liability, platform fee, payout, refund, and ledger
-- retention behavior require qualified tax/accounting/legal sign-off.
