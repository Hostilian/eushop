-- Migration: 006_pg_trgm_search_index.sql
-- Created at: 2026-07-04
-- Description: Enable pg_trgm extension and create GIN trigram indexes for fast search queries

-- Enable pg_trgm extension to allow trigram-based string matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN indexes using gin_trgm_ops for case-insensitive LIKE '%query%' optimization on name and description
CREATE INDEX IF NOT EXISTS idx_foods_name_trgm ON foods USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_foods_description_trgm ON foods USING gin (description gin_trgm_ops);

COMMENT ON INDEX idx_foods_name_trgm IS 'Trigram GIN index on food name for high-performance wildcard queries';
COMMENT ON INDEX idx_foods_description_trgm IS 'Trigram GIN index on food description for high-performance wildcard queries';
