-- Migration: 015_dsa_trader_registry_and_audit.sql
-- Description: DSA Art. 30 Trader Registry & Compliance Audit Logging Tables
-- COMPLIANCE-REVIEW: Implements Regulation (EU) 2022/2065 (DSA) Art. 30 traceability of traders.

CREATE TABLE IF NOT EXISTS dsa_trader_registry (
    id VARCHAR(36) PRIMARY KEY,
    seller_id VARCHAR(36) NOT NULL UNIQUE,
    legal_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    registration_number VARCHAR(100) NOT NULL,
    vat_number VARCHAR(50) NOT NULL,
    bank_account_iban VARCHAR(34) NOT NULL,
    self_certification_signed BOOLEAN DEFAULT FALSE NOT NULL,
    verification_status VARCHAR(50) DEFAULT 'PENDING' NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS compliance_audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(36) NOT NULL,
    action VARCHAR(100) NOT NULL,
    performed_by VARCHAR(36) NOT NULL,
    compliance_reference VARCHAR(100) NOT NULL, -- e.g. 'DSA-ART-30', 'DAC7', 'GDPR-ART-17'
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dsa_trader_seller_id ON dsa_trader_registry(seller_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_entity ON compliance_audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_ref ON compliance_audit_logs(compliance_reference);
