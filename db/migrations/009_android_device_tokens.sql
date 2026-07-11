-- Migration: 009_android_device_tokens.sql
-- Created at: 2026-07-11
-- Description: Create device_tokens table for Android push notifications

CREATE TABLE IF NOT EXISTS device_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_token VARCHAR(255) UNIQUE NOT NULL,
    device_type VARCHAR(50) DEFAULT 'android',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON device_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_device_tokens_token ON device_tokens(device_token);

COMMENT ON TABLE device_tokens IS 'Stores unique device registration tokens for Android/iOS push notifications per user profile.';

-- ROLLBACK BLOCK
-- To rollback this migration, run:
-- DROP TABLE IF EXISTS device_tokens;
