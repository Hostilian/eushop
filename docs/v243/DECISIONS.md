# EUshop V243 — Architecture Decision Records (ADRs)

---

## ADR-001: Multi-Seller Cart Splitting Architecture
- **Context**: A buyer's cart may contain specialty items from multiple independent European producers located in different Member States.
- **Decision**: Cart items are split client-side (`multi-seller-cart.ts`) into per-seller sub-orders (`SellerCartSubtotal`). Each sub-order computes independent shipping charges and destination VAT.
- **Status**: **ACCEPTED & IMPLEMENTED**

---

## ADR-002: Food Knowledge Graph & PostGIS Spatial Alignment
- **Context**: Authentic European foods are deeply tied to geography (PDO/PGI/TSG quality schemes). Administrative borders often differ from historical food regions.
- **Decision**: PostGIS spatial polygons (EPSG:4326) represent cultural and production zones separately from administrative country ISO codes.
- **Status**: **ACCEPTED & IMPLEMENTED**

---

## ADR-003: Non-Decorative DSA Article 30 Seller Disclosure
- **Context**: Regulation (EU) 2022/2065 (DSA) Art. 30 mandates persistent, non-decorative display of trader identity prior to transaction conclusion.
- **Decision**: Create a dedicated component (`TraderTraceabilityCard.tsx`) rendered on all product detail pages and checkout flows showing trade register numbers, EU VAT IDs, and physical business addresses.
- **Status**: **ACCEPTED & IMPLEMENTED**

---

## ADR-004: P0 Neutralization of External Key Harvesters
- **Context**: Legacy workflow `.github/workflows/harvest_keys.yml` attempted automated key scraping.
- **Decision**: Immediately disable harvesting workflows (`harvest_keys.yml.disabled`), enforce zero execution of harvester scripts, and add generated pools to `.gitignore`.
- **Status**: **ACCEPTED & IMPLEMENTED**
