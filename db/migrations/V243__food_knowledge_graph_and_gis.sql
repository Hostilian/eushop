-- Flyway Migration V243: Food Knowledge Graph, Living Map PostGIS, and Multi-Seller Commerce

-- Enable PostGIS extension if available
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Canonical Foods Table
CREATE TABLE IF NOT EXISTS canonical_foods (
    id VARCHAR(64) PRIMARY KEY,
    canonical_name VARCHAR(255) NOT NULL,
    local_names JSONB DEFAULT '{}'::jsonb,
    category VARCHAR(128) NOT NULL,
    origin_country_iso2 VARCHAR(2) NOT NULL,
    origin_region VARCHAR(128),
    history_context TEXT,
    traditional_technique TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Claim Provenance Table
CREATE TABLE IF NOT EXISTS claim_provenance (
    claim_id VARCHAR(64) PRIMARY KEY,
    canonical_food_id VARCHAR(64) REFERENCES canonical_foods(id) ON DELETE CASCADE,
    claim_text TEXT NOT NULL,
    source_citation TEXT NOT NULL,
    verification_status VARCHAR(64) NOT NULL DEFAULT 'REPORTED',
    confidence_score NUMERIC(3, 2) DEFAULT 0.80,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Cultural & Production Zones (PostGIS Spatial Geometries)
CREATE TABLE IF NOT EXISTS cultural_regions (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country_iso2 VARCHAR(2) NOT NULL,
    description TEXT,
    boundary_geom GEOMETRY(Polygon, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Producers Table (Separated from Sellers for DSA compliance)
CREATE TABLE IF NOT EXISTS producers (
    id VARCHAR(64) PRIMARY KEY,
    brand_name VARCHAR(255) NOT NULL,
    legal_entity_name VARCHAR(255) NOT NULL,
    country_iso2 VARCHAR(2) NOT NULL,
    facility_address TEXT NOT NULL,
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    established_year INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Multi-Seller Marketplace Orders
CREATE TABLE IF NOT EXISTS marketplace_orders (
    id VARCHAR(64) PRIMARY KEY,
    buyer_id VARCHAR(64) NOT NULL,
    grand_total_cents BIGINT NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    stripe_payment_intent_id VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seller_orders (
    id VARCHAR(64) PRIMARY KEY,
    marketplace_order_id VARCHAR(64) REFERENCES marketplace_orders(id) ON DELETE CASCADE,
    seller_id VARCHAR(64) NOT NULL,
    subtotal_cents BIGINT NOT NULL,
    shipping_fee_cents BIGINT NOT NULL,
    vat_cents BIGINT NOT NULL,
    total_cents BIGINT NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    status VARCHAR(64) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_lines (
    id VARCHAR(64) PRIMARY KEY,
    seller_order_id VARCHAR(64) REFERENCES seller_orders(id) ON DELETE CASCADE,
    offer_id VARCHAR(64) NOT NULL,
    producer_product_id VARCHAR(64) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price_cents BIGINT NOT NULL,
    total_cents BIGINT NOT NULL,
    lot_code VARCHAR(128)
);

-- Indexes for fast spatial and relational querying
CREATE INDEX IF NOT EXISTS idx_canonical_foods_category ON canonical_foods(category);
CREATE INDEX IF NOT EXISTS idx_canonical_foods_origin ON canonical_foods(origin_country_iso2, origin_region);
CREATE INDEX IF NOT EXISTS idx_seller_orders_marketplace ON seller_orders(marketplace_order_id);
CREATE INDEX IF NOT EXISTS idx_order_lines_seller_order ON order_lines(seller_order_id);
