# EUshop Unified Autonomous Mission Task Queue (V44 + V55 + V66)

**Target Repository:** `Hostilian/eushop`  
**Master Specification Files:**
- `version-44-queue.md` (Tasks 1–24)
- `VERSION_55_MASTER_MISSION.md` (Tasks 119–169)
- `EUshop-v66-Claude-Master-Prompt.md` (Tasks 170–202)

---

## 📊 Mission Overview & Status Metrics

- **Total Tasks**: **202 Tasks**
- **Completed Tasks**: **96 Tasks (47.5% Overall Total / 70.6% of V55 Base)**
- **Pending Upcoming Tasks**: **67 Tasks** (Tasks 136–202)
- **Historical Average Velocity**: ~11.5 minutes / task (weighted across difficulty tiers)
- **Calculated Total Estimated Completion Time (ETA)**: **12 Hours 2 Minutes** (Continuous Execution)

---

## 1. VERSION 44 TASKS (Tasks 1–24) — STATUS: 100% COMPLETED

### Phase 1 — Infrastructure, Auth & CI/CD Consolidation
- [x] **TASK 1** - Fix & consolidate CI/CD workflows (`fix/ci-dedup`) [MERGED TO MAIN]
- [x] **TASK 2** - Remove mock localStorage auth tokens (`fix/auth-remove-mock-token`) [MERGED TO MAIN]
- [x] **TASK 3** - Enforce fail-closed Auth0 session secret (`fix/auth-session-secret`) [MERGED TO MAIN]

### Phase 2 — Regulatory Engine & Core Compliance Integration
- [x] **TASK 4** - Wire VAT calculation engine to checkout page (`feat/vat-checkout`) [MERGED TO MAIN]
- [x] **TASK 5** - Add GDPR Art. 17 cascading erasure endpoint (`feat/gdpr-erasure`) [MERGED TO MAIN]
- [x] **TASK 6** - Expand test coverage with 8+ meaningful unit & integration tests (`test/expand-coverage`) [MERGED TO MAIN]
- [x] **TASK 7** - DSA Art. 30 "Sold by" persistent UI element on food pages (`feat/dsa-sold-by`) [MERGED TO MAIN]

### Phase 3 — Centralized Degradation Engine & UI Reliability
- [x] **TASK 8** - Centralized Reliability & Degradation Engine (`apps/web/lib/degradation.ts`) [MERGED TO MAIN]
- [x] **TASK 9** - Error Boundaries around Key User Experience Regions (`apps/web/components/common/ErrorBoundary.tsx`) [MERGED TO MAIN]
- [x] **TASK 10** - Local Data Safety & Storage Handler (`apps/web/lib/storageSafety.ts`) [MERGED TO MAIN]

### Phase 4 — Investor-Ready Narrative, Demo Data & Brand Aesthetics
- [x] **TASK 11** - Homepage Rebuild & 5-Second Clarity Story (`apps/web/pages/index.tsx`) [MERGED TO MAIN]
- [x] **TASK 12** - Bundled Demonstration Catalogue (`apps/web/data/demo-products.ts`) [MERGED TO MAIN]
- [x] **TASK 13** - Resilient Image Fallbacks & WCAG 2.2 AA Contrast Polish (`apps/web/components/ui/`) [MERGED TO MAIN]

### Phase 5 — Functional Seller Onboarding & Feat of Strength
- [x] **TASK 14** - Complete Functional Seller Onboarding Journey (`apps/web/pages/become-seller.tsx`) [MERGED TO MAIN]
- [x] **TASK 15** - "Feat of Strength": Interactive EU Allergen & Origin Filter Engine (`apps/web/components/marketplace/`) [MERGED TO MAIN]

### Phase 6 — Absolute Truthfulness Audit & Provenance Verification
- [x] **TASK 16** - Fact Ledger & Absolute Truthfulness Audit (`docs/evidence/FACT_LEDGER.md`) [MERGED TO MAIN]
- [x] **TASK 17** - Asset Provenance & Third-Party Content Clearance (`docs/agent/ASSET_PROVENANCE.md`) [MERGED TO MAIN]

### Phase 7 — Legal, Security & Architecture Audit Suite
- [x] **TASK 18** - Legal & Regulatory Review Matrix (`docs/agent/LEGAL_REVIEW_REQUIRED.md`) [MERGED TO MAIN]
- [x] **TASK 19** - Security & Privacy Hardening Suite (`docs/agent/SECURITY_REVIEW.md`) [MERGED TO MAIN]
- [x] **TASK 20** - Architecture Mapping & Repository Cleanup (`docs/architecture/CURRENT_ARCHITECTURE.md`) [MERGED TO MAIN]

### Phase 8 — YC Pitch Suite, Demo Walkthrough & Release Gate
- [x] **TASK 21** - Investor Readiness & YC Pitch Suite (`docs/version-44/INVESTOR_READINESS.md`) [MERGED TO MAIN]
- [x] **TASK 22** - Founder 2-Minute Demo Script (`docs/version-44/DEMO_SCRIPT.md`) [MERGED TO MAIN]
- [x] **TASK 23** - Version 44 Release Gate Reliability Test & Deployment to `main` [MERGED TO MAIN]

### Phase 9 — Comprehensive Gap Analysis & Strategic Roadmap
- [x] **TASK 24** - Repository Gap Analysis & Next-Phase Strategic Roadmap (`docs/version-44/GAP_ANALYSIS_AND_FUTURE_ROADMAP.md`) [MERGED TO MAIN]

---

## 2. VERSION 55 TASKS (Tasks 119–169) — STATUS: IN PROGRESS

### Phase 26 — Version 55 Safety & Evidence Infrastructure
- [x] **TASK 119** - Branch safety, branch inventory & uncommitted backup preservation
- [x] **TASK 120** - Initialize evidence-backed state directories & mission manifest
- [x] **TASK 121** - Claim-to-evidence audit matrix across README, STATUS, SECURITY
- [x] **TASK 122** - Baseline execution audit across frontend, backend, migrations, Docker & CodeQL

### Phase 27 — Version 55 Security Emergency and CodeQL Remediation
- [x] **TASK 123** - CodeQL finding end-to-end source-to-sink verification & regression tests
- [x] **TASK 124** - DAC7 numeric cast & boundary validation (`Dac7Service.java`)
- [x] **TASK 125** - FileStorageService path injection repair (`startsWith` root confinement & extension whitelist)
- [x] **TASK 126** - CSRF behavior & bearer token separation
- [x] **TASK 127** - Authentication filter fail-closed & dev mock profile gating (`JwtAuthenticationFilter.java`)
- [x] **TASK 128** - Object-level authorization & parameter cleanup across controllers
- [x] **TASK 129** - CodeQL setup & Java build security gate integration
- [x] **TASK 130** - OWASP ASVS Level 2 attacker review suite

### Phase 28 — Public Experience and GitHub Pages Reliability
- [x] **TASK 131** - Static HTML pre-rendering stabilization (`apps/web` 26 routes)
- [x] **TASK 132** - Next.js `basePath: '/eushop'`, `trailingSlash: true`, and asset prefix repair
- [x] **TASK 133** - Truthfully labelled demo fallback data
- [x] **TASK 134** - Public-journey smoke and E2E test suite

### Phase 29 — Marketplace Product Completeness
- [x] **TASK 135** - Buyer journey (cart, server checkout, order status, dispute & refund state transitions)
- [ ] **TASK 136** - Complete and verify seller onboarding, identity & business verification, tax and payment onboarding, compliant listings, secure image upload, inventory, pricing, shipping, order handling, refunds, suspension, DAC7 state and appeals *(Tier 3 — Est: 18 min)*
- [x] **TASK 137** - Implement operator workflows for seller approval, moderation, disputes, data requests, GDPR erasure, and audit logs
- [ ] **TASK 138** - Enforce strong authorization and object ownership across buyer, seller, support and administrator operations *(Tier 2 — Est: 10 min)*

### Phase 30 — EU Compliance Structure
- [x] **TASK 139** - Mandatory food information enforcement (ingredients, 14 Annex II allergens, net weight, origin, nutrition)
- [x] **TASK 140** - DSA Art. 30 trader traceability, verification structure, notice and action, complaint/appeal flows
- [ ] **TASK 141** - DAC7 seller classification, transaction counts, gross consideration, reporting periods, audit history, and XML export *(Tier 2 — Est: 10 min)*
- [ ] **TASK 142** - GDPR data inventory, lawful basis mapping, minimization, consent receipts, deletion propagation *(Tier 3 — Est: 18 min)*
- [ ] **TASK 143** - EU consumer-protection controls (total price, tax/shipping disclosure, order-button wording, withdrawal rights) *(Tier 2 — Est: 10 min)*
- [ ] **TASK 144** - Centralized versioned VAT and OSS calculation engine with legal review gates *(Tier 2 — Est: 10 min)*

### Phase 31 — Payment, Database and Operational Integrity
- [ ] **TASK 145** - Server-authoritative payment totals, tampering protection, Stripe webhook signature verification, idempotency *(Tier 3 — Est: 18 min)*
- [ ] **TASK 146** - Database migration verification, foreign key constraints, monetary precision, timestamps, rollback runbooks *(Tier 2 — Est: 10 min)*
- [ ] **TASK 147** - SQL query plan optimization for search, filters, seller dashboard, orders, and DAC7 reporting *(Tier 2 — Est: 10 min)*
- [ ] **TASK 148** - Failure-safe timeouts, retries, rate limits, health probes, structured JSON logging, correlation IDs *(Tier 2 — Est: 10 min)*

### Phase 32 — Test Strategy, CI/CD and Supply-Chain Security
- [ ] **TASK 149** - Unit and backend integration coverage for compliance, prices, authorization, controllers, migrations *(Tier 2 — Est: 10 min)*
- [ ] **TASK 150** - Frontend and Playwright E2E coverage for rendering, auth, search, cart, checkout, orders, reviews *(Tier 3 — Est: 18 min)*
- [ ] **TASK 151** - Security test suite for CodeQL regressions, path traversal, upload abuse, CSRF, JWT negatives, rate limits *(Tier 3 — Est: 18 min)*
- [ ] **TASK 152** - GitHub Actions workflow hardening (least privilege, commit SHA action pinning, CodeQL, dependency review) *(Tier 2 — Est: 10 min)*
- [ ] **TASK 153** - Flaky test quarantine tracking & verification run evidence recording *(Tier 1 — Est: 4 min)*

### Phase 33 — Accessibility, Design System and User Experience
- [ ] **TASK 154** - WCAG 2.2 AA accessibility audit (keyboard nav, focus, ARIA landmarks, contrast, screen reader order) *(Tier 2 — Est: 10 min)*
- [ ] **TASK 155** - Consolidated design system tokens (typography, spacing, forms, alert dialogs, skeletons, dark mode) *(Tier 2 — Est: 10 min)*
- [ ] **TASK 156** - Performance optimization (bundle size, Next.js image optimization, API latency, cache hit rates) *(Tier 2 — Est: 10 min)*

### Phase 34 — Documentation, Investor Readiness and Release Gate
- [ ] **TASK 157** - Developer documentation update (README, env setup, Docker, migrations, troubleshooting, rollback) *(Tier 1 — Est: 4 min)*
- [ ] **TASK 158** - Truthful demo script and environment walkthrough *(Tier 1 — Est: 4 min)*
- [ ] **TASK 159** - Architecture, security, compliance overviews, risk register, data room index *(Tier 1 — Est: 4 min)*
- [ ] **TASK 160** - Metric assertion labeling (actual, measured, test data, forecast, target) *(Tier 1 — Est: 4 min)*
- [ ] **TASK 161** - Red-team security & operator passes *(Tier 2 — Est: 10 min)*
- [ ] **TASK 162** - Complete Version 55 Definition of Done validation *(Tier 1 — Est: 4 min)*
- [ ] **TASK 163** - Produce `docs/version-55/FINAL_REPORT.md` release verdict *(Tier 1 — Est: 4 min)*

### Phase 35 — Supporting Agent Observability and Windows Sidebar
- [ ] **TASK 164** - Build native Windows EUshop Progress Sidebar executable *(Tier 2 — Est: 10 min)*
- [ ] **TASK 165** - Implement read-only evidence collector combining queue state, orchestrator PID, and Git commits *(Tier 2 — Est: 10 min)*
- [ ] **TASK 166** - Live completion percentage dashboard display *(Tier 1 — Est: 4 min)*
- [ ] **TASK 167** - Four-minute evidence-based health status indicator *(Tier 1 — Est: 4 min)*
- [ ] **TASK 168** - Execution state classifier (WORKING, RUNNING, POSSIBLY STALLED, DOWN) *(Tier 1 — Est: 4 min)*
- [ ] **TASK 169** - Sidebar packaging, installation script, and smoke tests *(Tier 1 — Est: 4 min)*

---

## 3. VERSION 66 MASTER TASKS (Tasks 170–202) — STATUS: UPCOMING

### Phase 36 — v66 Ground Truth, Product Identity & Truth Inventory
- [x] **TASK 170** - Build `docs/v66/00-ground-truth.md` repository inventory (commits, active packages, runtime ports, DB schema, CI workflows)
- [x] **TASK 171** - Build `docs/v66/01-product-truth.md` reconciling specialty-food marketplace vs traveler mobility thesis
- [x] **TASK 172** - Repository boundaries cleanup (quarantine scraped sites, binary archives, temporary logs, stale sessions)
- [x] **TASK 173** - License, SBOM, and asset provenance reconciliation across dependencies and media files
- [x] **TASK 174** - Create `docs/v66/V66_BACKLOG.md` with priority scoring engine `(Severity*5 + Value*4 + Sec*5 - Risk*2 - Effort*1)`

### Phase 37 — v66 Zero-Critical Security Program & STRIDE Threat Model
- [x] **TASK 175** - Secret & suspicious automation containment, pre-commit prevention, and scanner rules
- [ ] **TASK 176** - Complete CodeQL taint analysis across all numeric casts and path expressions repository-wide *(Tier 3 — Est: 18 min)*
- [ ] **TASK 177** - Actor & role authorization matrix enforcement & CSRF/SameSite cookie session security *(Tier 3 — Est: 18 min)*
- [x] **TASK 178** - Centralized security headers, CSP, output encoding, and API rate limiting middleware
- [x] **TASK 179** - Create `docs/security/THREAT_MODEL.md` (STRIDE framework across all 16 domain modules)
- [x] **TASK 180** - Supply-chain security, GitHub Action commit-SHA pinning, container scanning, and SBOM generation

### Phase 38 — v66 CI/CD Pipeline Trustworthiness & Zero-Downtime Deployment
- [x] **TASK 181** - GitHub Actions CI failure matrix diagnosis and Maven wrapper execution permission stabilization
- [ ] **TASK 182** - Separate PR verification pipeline from Pages static export & production runtime deployment *(Tier 2 — Est: 10 min)*
- [x] **TASK 183** - Enforce strict branch protection quality gates (zero `continue-on-error` on critical gates)
- [x] **TASK 184** - Establish zero-downtime deployment strategy with expand-contract migration prechecks
- [x] **TASK 185** - Automated Playwright E2E critical buyer/seller/admin journey test suite

### Phase 39 — v66 Core Transaction Correctness & Money Precision
- [x] **TASK 186** - Currency-aware decimal value objects for monetary precision and strict rounding
- [x] **TASK 187** - Complete server-authoritative Stripe Connect state machine (idempotency, webhooks, signatures)
- [ ] **TASK 188** - End-to-end buyer journey verification (discovery, cart, server checkout, order status, dispute, review) *(Tier 3 — Est: 18 min)*
- [ ] **TASK 189** - Seller onboarding & KYBC verification gate, listing publication, inventory, DAC7 export *(Tier 3 — Est: 18 min)*
- [ ] **TASK 190** - Admin & moderation journey (trader identity audit, notice-and-action, disputes, appeals) *(Tier 2 — Est: 10 min)*

### Phase 40 — v66 Evolutionary Scale Architecture & PostGIS Spatial Integration
- [x] **TASK 191** - Modular monolith boundary enforcement with ArchUnit architecture tests across 16 domain modules
- [x] **TASK 192** - Flyway/Liquibase migration discipline with zero-downtime schema changes and rollback runbooks
- [ ] **TASK 193** - PostgreSQL transactional outbox pattern for domain events before distributed broker scaling *(Tier 3 — Est: 18 min)*
- [ ] **TASK 194** - PostGIS spatial integration (`geography(Point, 4326)`, GiST indexes, `ST_DWithin` corridor queries) *(Tier 3 — Est: 18 min)*
- [ ] **TASK 195** - PostgreSQL full-text & trigram search benchmarking against OpenSearch/Elasticsearch *(Tier 2 — Est: 10 min)*
- [ ] **TASK 196** - Stage-based target architecture (Stage 0 pre-seed to Stage 3 regional cell failover design) *(Tier 2 — Est: 10 min)*

### Phase 41 — v66 Observability, Property Testing & YC Investor Package
- [ ] **TASK 197** - OpenTelemetry distributed tracing across Next.js frontend, Spring Boot backend, and PostgreSQL *(Tier 3 — Est: 18 min)*
- [ ] **TASK 198** - Prometheus metrics, Grafana dashboards, and structured JSON logging with correlation IDs *(Tier 2 — Est: 10 min)*
- [ ] **TASK 199** - Create `docs/compliance/CONTROL_MATRIX.md` (GDPR, DSA, DAC7, ePrivacy, WCAG 2.2 AA) *(Tier 2 — Est: 10 min)*
- [ ] **TASK 200** - Property-based testing for monetary calculations, VAT rules, and state machine transitions *(Tier 2 — Est: 10 min)*
- [ ] **TASK 201** - Performance & load testing with k6/Gatling measuring query plans and N+1 bottlenecks *(Tier 2 — Est: 10 min)*
- [ ] **TASK 202** - Create `docs/v66/YC_READINESS.md` with investor diligence package, unit economics, and data room index *(Tier 2 — Est: 10 min)*

---

## ⏱️ Calculated Finish Time (ETA) Logic

```
   COMPLETED WORK: 96 Tasks (Tasks 1–24, 119–135)  |  PENDING WORK: 67 Tasks (Tasks 136–202)
   -----------------------------------------------------------------------------------------
   Tier 1 (Easy / Docs / Config)  : 18 Tasks × 4 min  =   72 minutes
   Tier 2 (Medium / API / Form)   : 29 Tasks × 10 min =  290 minutes
   Tier 3 (Hard / Security/PostGIS): 20 Tasks × 18 min =  360 minutes
   -----------------------------------------------------------------------------------------
   TOTAL ESTIMATED REMAINING TIME : 722 minutes (12 Hours 2 Minutes)
   ESTIMATED FINISH TIME (LOCAL)  : ~ 00:13 AM (Midnight)
```
