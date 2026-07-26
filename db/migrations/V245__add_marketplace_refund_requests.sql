-- V245: Add durable, idempotent marketplace refund requests.
-- Expand-only migration; do not edit V243 or V244.

CREATE TABLE IF NOT EXISTS marketplace_refunds (
    id VARCHAR(64) PRIMARY KEY,
    marketplace_order_id VARCHAR(64) NOT NULL
        REFERENCES marketplace_orders(id),
    seller_order_id VARCHAR(64) NOT NULL
        REFERENCES seller_orders(id),
    actor_id VARCHAR(64) NOT NULL
        REFERENCES users(id),
    amount_cents BIGINT NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    reason VARCHAR(500),
    idempotency_key VARCHAR(128) NOT NULL,
    stripe_refund_id VARCHAR(255),
    status VARCHAR(32) NOT NULL DEFAULT 'REQUESTED',
    failure_reason VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_marketplace_refunds_idempotency UNIQUE (idempotency_key),
    CONSTRAINT uq_marketplace_refunds_stripe_id UNIQUE (stripe_refund_id),
    CONSTRAINT ck_marketplace_refunds_amount_positive CHECK (amount_cents > 0),
    CONSTRAINT ck_marketplace_refunds_currency CHECK (currency = 'EUR'),
    CONSTRAINT ck_marketplace_refunds_status CHECK (
        status IN ('REQUESTED', 'SUBMITTED', 'SUCCEEDED', 'FAILED')
    )
);

CREATE INDEX IF NOT EXISTS idx_marketplace_refunds_seller_created
    ON marketplace_refunds(seller_order_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_marketplace_refunds_status
    ON marketplace_refunds(status);

-- COMPLIANCE-REVIEW: Refund VAT corrections, fee allocation, seller transfer
-- reversals, and retention periods require tax/accounting/legal sign-off.
