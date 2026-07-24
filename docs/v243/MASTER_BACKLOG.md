# EUshop V243 — Master Backlog

**Version:** V243  
**Orchestrator:** Agent 00 Executive Orchestrator  
**Last Updated:** July 2026  

---

## Master Domain Backlog

### Domain 1: Multi-Seller Commerce & Financial Ledger
- [x] **C-01**: Multi-seller cart domain model & cart splitting (`multi-seller-cart.ts`)
- [x] **C-02**: Server-authoritative Stripe Connect payout state machine & refund flow
- [x] **C-03**: Offer comparison engine by price, unit price (€/kg), maturation, rating (`OfferComparisonEngine.tsx`)
- [ ] **C-04**: Accounting-grade internal immutable financial ledger (`MarketplaceLedger`)

### Domain 2: Food Knowledge Graph & Quality Schemes
- [x] **FKG-01**: Canonical food identity, variants, aliases, and multi-lingual translations model (`v243.ts`)
- [x] **FKG-02**: Food ontology & entity relationships (`ORIGINATES_IN`, `CONTAINS`, `PROTECTED_BY`)
- [x] **FKG-03**: eAmbrosia / GIview quality scheme verifier for PDO/PGI/TSG certifications (`eambrosia-verifier.ts`)

### Domain 3: Living Map of European Food
- [x] **MAP-01**: PostGIS spatial schema for administrative, cultural, and production zones (`V243__food_knowledge_graph_and_gis.sql`)
- [x] **MAP-02**: Interactive MapLibre GL map with coordinate pin clusters and accessible list view fallback (`map.tsx`)
- [x] **MAP-03**: Map zoom level semantics (Continental → Country → Region → Locality)

### Domain 4: Trust & DSA Article 30 Compliance
- [x] **TRU-01**: Persistent, non-decorative DSA Art. 30 Trader Traceability Card (`TraderTraceabilityCard.tsx`)
- [x] **TRU-02**: DSA Notice & Action moderation dashboard for content takedowns (`moderation.tsx`)
- [x] **TRU-03**: Strict KYBC seller verification gate on `FoodController.java` listing activation

### Domain 5: Discovery, Semantic Search & Mobile Parity
- [x] **SRC-01**: Global `Cmd+K` keyboard shortcut command palette modal (`CommandPalette.tsx`)
- [x] **SRC-02**: Out-of-stock zero-result specialty food acquisition demand capture modal (`DemandCaptureModal.tsx`)
- [x] **MOB-01**: React Native Expo camera barcode/QR lookup scanner (`BarcodeScannerScreen.tsx`)

### Domain 6: Security & Pipeline Quality
- [x] **SEC-01**: P0 Security Quarantine of key-harvesting workflow (`harvest_keys.yml.disabled`)
- [x] **SEC-02**: Remediation of all 16 CodeQL security & quality alerts in Spring Boot core service
- [x] **CI-01**: Static export pre-rendering audit for GitHub Pages hosting (`31/31 static HTML pages pre-rendered`)
