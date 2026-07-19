-- Migration: 012_gdpr_erasure_columns.sql
-- Created at: 2026-07-19
-- Description: Add GDPR Art. 17 erasure support - soft delete and erasure tracking columns

-- Add soft delete and erasure tracking columns to users table
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL,
    ADD COLUMN IF NOT EXISTS erasure_requested_at TIMESTAMP NULL,
    ADD COLUMN IF NOT EXISTS erasure_processed_at TIMESTAMP NULL,
    ADD COLUMN IF NOT EXISTS erasure_reason VARCHAR(255) NULL;

-- Add indexes for efficient querying of active/non-deleted users
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_erasure_requested ON users(erasure_requested_at) WHERE erasure_requested_at IS NOT NULL;

-- Note: Actual erasure/anonymization of PII data will be performed by the
-- DELETE /api/users/{id}/erase endpoint, which will nullify/pseudonymize
-- personal data in users, orders, reviews, and conversations tables
-- COMPLIANCE-REVIEW: verify erasure cascades to all subprocessors