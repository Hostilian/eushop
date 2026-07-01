-- Migration: 002_compliance_fields.sql
-- Created at: 2026-07-01
-- Description: Add KYBC, DAC7, and regulatory fields to users and foods

-- Add compliance fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS tax_id VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS vat_number VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS trade_register_number VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address_street VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address_city VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address_postal_code VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS self_certified_compliant BOOLEAN DEFAULT FALSE;

-- Enforce description and allergens to be mandatory in foods for EU consumer labeling
ALTER TABLE foods ALTER COLUMN allergens SET NOT NULL;
ALTER TABLE foods ALTER COLUMN description SET NOT NULL;

-- Create indexes for new search/verification fields
CREATE INDEX IF NOT EXISTS idx_users_verified ON users(verified);
CREATE INDEX IF NOT EXISTS idx_users_self_certified ON users(self_certified_compliant);
