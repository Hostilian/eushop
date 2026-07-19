-- Migration: 003_consent_log.sql
-- Created at: 2026-07-04
-- Description: GDPR-compliant consent event log and support for data portability

-- Consent log: records every consent grant or withdrawal for audit trail.
-- The IP address and user-agent are HASHED (not stored raw) to minimise PII footprint.
CREATE TABLE IF NOT EXISTS consent_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  consent_type    VARCHAR(60) NOT NULL,    -- e.g. 'cookie_analytics', 'cookie_marketing', 'terms_v1'
  consent_version VARCHAR(20) NOT NULL,    -- version of the terms/policy accepted (e.g. '2026-07-01')
  granted         BOOLEAN NOT NULL,         -- true = accepted, false = withdrawn
  ip_hash         VARCHAR(64),              -- SHA-256 of IP — never store raw IP
  user_agent_hash VARCHAR(64),              -- SHA-256 of User-Agent
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consent_log_user_id  ON consent_log(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_log_type     ON consent_log(consent_type);
CREATE INDEX IF NOT EXISTS idx_consent_log_created  ON consent_log(created_at);

-- Add stripe_payment_intent_id to orders table for webhook-based payment confirmation.
-- The webhook handler uses this column to look up the order and update its status.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(100) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_orders_stripe_pi ON orders(stripe_payment_intent_id);

COMMENT ON TABLE consent_log IS
  'Immutable audit trail of GDPR consent events per user. Never delete rows. Use granted=false to record withdrawals.';
COMMENT ON COLUMN consent_log.ip_hash IS
  'SHA-256 hash of the user IP address at consent time. Raw IPs are not stored.';
