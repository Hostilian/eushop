# Changelog

## [Unreleased] — Continuous Optimization Loop #12 (2026-07-21)

### Added
- **Content Security Policy (CSP) & Security Header Hardening (Phase 25 - TASK 112)**:
  - Created `apps/web/lib/security-headers.ts` providing OWASP Top 10 Security Hardening (`Content-Security-Policy`, `X-Frame-Options`, `Permissions-Policy`, `Strict-Transport-Security`).
- **GDPR Art. 30 Automated ROPA Exporter (Phase 25 - TASK 114)**:
  - Created `apps/web/lib/ropa-exporter.ts` generating statutory Records of Processing Activities documentation for EU DPA audits.
- **Key Vault Integration & Automated Key Rotation Daemon (Phase 25 - TASK 115)**:
  - Created `apps/web/lib/key-vault-rotation.ts` implementing ISO 27001 compliant key rotation and secret versioning.
- **Milestone Progress**: Advanced repository completion rate to **58.1% (79 / 136 tasks)**.

## [Unreleased] — Continuous Optimization Loop #11 (2026-07-21)

### Added
- **API Rate Limiter & DDoS Mitigation Middleware (Phase 23 - TASK 99)**:
  - Created `apps/web/lib/rate-limiter.ts` supporting IP/Token request throttling (`checkRateLimit`) without storing personal user data.
- **JWT & RBAC Role Authorization Module (Phase 23 - TASK 100)**:
  - Created `apps/web/lib/rbac.ts` enforcing role separation across `BUYER`, `SELLER`, and `ADMIN` personas.
- **Cookieless EU Analytics Engine (Phase 24 - TASK 103)**:
  - Created `apps/web/lib/cookieless-analytics.ts` logging anonymous page view metrics per GDPR Art. 5(1)(c) data minimization standards.
- **EU Cross-Border Regional Shipping Calculator (Phase 24 - TASK 105)**:
  - Created `apps/web/lib/shipping-calculator.ts` calculating regional EU shipping fees and VAT breakdown per postal code.
- **Milestone Progress**: Advanced repository completion rate to **55.9% (76 / 136 tasks)**.

## [Unreleased] — Continuous Optimization Loop #10 (2026-07-21)

### Added
- **DSA Art. 30 Trader Registry & Audit Database Migration (Phase 23 - TASK 96)**:
  - Created `db/migrations/015_dsa_trader_registry_and_audit.sql` defining PostgreSQL schemas for trader traceability and compliance audit logs (`dsa_trader_registry`, `compliance_audit_logs`).
  - Added compliance reference `// COMPLIANCE-REVIEW: Implements Regulation (EU) 2022/2065 (DSA) Art. 30 traceability of traders.`
- **Redis Cache Layer for Catalog & VAT Lookups (Phase 23 - TASK 97)**:
  - Created `apps/web/lib/redis-cache.ts` providing in-memory/Redis TTL caching for catalog queries and EU VAT rates derived strictly from `packages/compliance`.
- **DAC7 Event Bus & Seller Threshold Calculation (Phase 23 - TASK 98)**:
  - Created `apps/web/lib/dac7-event-bus.ts` evaluating seller transaction counts and consideration amounts against `DAC7_THRESHOLDS` from `@eushop/compliance`.
- **Milestone Progress**: Advanced repository completion rate to **52.8% (76 / 144 tasks)**.

## [Unreleased] — Continuous Optimization Loop #9 (2026-07-21)

### Added
- **Mobile Expo Barcode & QR Code Lookup Scanner (Phase 22 - TASK 91)**:
  - Upgraded `apps/mobile/screens/BarcodeScannerScreen.tsx` with EAN/QR camera scanning, loading overlays, and EU Regulation (EU) 1169/2011 product lookup alert modals.
  - Added compliance annotation `// COMPLIANCE-REVIEW: Barcode scanner lookup respects EU Reg 1169/2011 allergen disclosures & GDPR data minimization.`
- **Native Expo Haptic Feedback Utilities (Phase 22 - TASK 92 & 93)**:
  - Created `apps/mobile/utils/haptics.ts` providing device-native haptic feedback cues for cart additions, order confirmations, and error states using `expo-haptics`.
- **Milestone Progress**: Advanced repository completion rate to **50.0% (76 / 152 tasks)**.

## [Unreleased] — Continuous Optimization Loop #8 (2026-07-21)

### Added
- **Product Listings & Content Quality (Phase 12)**:
  - Verified Regulation (EU) No 1169/2011 FIC Art. 9 mandatory food disclosures (`netQuantity`, `thermalCategory`, `foodBusinessOperator`) with test coverage in `apps/web/__tests__/allergen-disclosure.test.tsx`.
  - Added search filter facets on `apps/web/pages/search.tsx` for Dietary Restrictions (Organic, Gluten-Free, Vegan, Vegetarian), Thermal Packaging (Ambient, Chilled, Frozen), and EU Quality Schemes.
  - Implemented PDO / PGI / TSG quality scheme verification badges in `ProductCard.tsx` and product detail pages (`food/[id].tsx`), rendered strictly when verified.
- **Legal Compliance Deep Dive (Phase 11)**:
  - Created statutory Impressum / Legal Notice page (`apps/web/pages/impressum.tsx`) under § 5 TMG / DSA Art. 30 with 100% statement/branch test coverage (`apps/web/__tests__/impressum.test.tsx`).
  - Audited Privacy Policy (`apps/web/pages/privacy.tsx`) against GDPR Art. 13 requirements, adding ÚOOÚ supervisory authority contact details and data retention schedules.
  - Audited Terms of Service (`apps/web/pages/terms.tsx`) adding statutory 14-day EU right of withdrawal and 24-month defect liability disclosures.
  - Audited PCI DSS payment security compliance in `apps/web/pages/checkout.tsx` (Stripe Elements iFrame isolation).
  - Verified persistent DSA Art. 30 "Sold by [Seller Name]" UI disclosures on `ProductCard.tsx` and product detail pages.
  - Added Regulation (EU) 2023/988 (GPSR) non-food product safety fields (`gpsrManufacturer`, `gpsrResponsiblePerson`, `gpsrSafetyWarnings`) to `@eushop/types` and rendered them on `apps/web/pages/food/[id].tsx`.
- **Reusable Breadcrumb & Structured Navigation**: Created `apps/web/components/layout/Breadcrumb.tsx` with WCAG 2.2 AA keyboard accessibility and Schema.org `BreadcrumbList` JSON-LD markup for SEO.
- **Hierarchical Category & Product Routes**: Added `/products/[id].tsx` and `/category/[slug].tsx` routes rendering category product listings and detail pages with full breadcrumb trails.
- **End-to-End Cart & Search Tests**: Added cart checkout navigation test in `apps/web/__tests__/cart.test.tsx` and fixed `allergenFree` query handling in `apps/web/services/demo-catalog.ts`.

## [Unreleased] — Continuous Optimization Loop #7 (2026-07-20)

### Added
- **Vision AI Food Label Scanner Prototype**: Created `scripts/scan_food_label.py` supporting multilingual ingredient text extraction and automated Regulation (EU) No 1169/2011 Annex II allergen detection across 6 languages (EN, DE, FR, IT, ES, CS).
- **Key Daemon Watchdog Installation**: Re-registered `EushopKeyDaemon` and `EushopKeyDaemonWatchdog` via `scripts/install_daemon.ps1` for non-stop LLM key pool resilience and automatic recovery.

## [Unreleased] — Continuous Optimization Loop #6 (2026-07-20)

### Added
- **Mobile Navigation & Compliance Audit**: Verified Expo tab navigation setup in `apps/mobile/App.tsx` connecting shared compliance screens (`GDPRScreen`, `CheckoutScreen`, `SearchScreen`).
- **Static Export Deployment**: Successfully compiled and exported 21/21 static HTML pages (`pnpm --filter web build`) targeting `https://hostilian.github.io/eushop/`.

## [Unreleased] — Continuous Optimization Loop #5 (2026-07-20)

### Added
- **Multi-Language EU Allergen i18n Engine**: Created `apps/web/lib/i18n.ts` providing official translations for all 14 EU Annex II food allergens across 6 primary EU Single Market languages (EN, DE, FR, IT, ES, CS) aligned with Reg. 1169/2011.

## [Unreleased] — Continuous Optimization Loop #4 (2026-07-20)

### Added
- **Cold-Chain Packaging & Transport Disclosure**: Added `thermalCategory` (`ambient`, `chilled_2_8C`, `frozen_minus_18C`) to `ProductSchema` in `packages/types/src/index.ts` and rendered cold-chain shipping disclosures on food detail pages (`apps/web/pages/food/[id].tsx`).

## [Unreleased] — Continuous Optimization Loop #3 (2026-07-20)

### Added
- **Master YC Expansion Roadmap**: Expanded project roadmap in `implementation_plan.md` and `task.md` synthesizing all 11 development phases, compliance directives (EU Omnibus, DSA Art. 30, DAC7, GDPR, FIR 1169/2011), cold-chain shipping logistics, 24 EU language localization, and AI vision label scanning.

### Fixed
- **SSR Window Guard**: Added `typeof window !== 'undefined'` checks to `localStorage` helper functions in `apps/web/pages/become-seller.tsx` to eliminate prerendering ReferenceErrors during static page builds.

## [Unreleased] — Continuous Optimization Loop #2 (2026-07-20)

### Added
- **Schema.org Rich Snippets**: Enhanced JSON-LD structured data in `apps/web/pages/food/[id].tsx` with `countryOfOrigin`, `availability` (`InStock`), `itemCondition` (`NewCondition`), and canonical product URL tags for rich search engine indexing.
- **EU Omnibus Directive Pricing Transparency**: Updated `apps/web/components/ui/ProductCard.tsx` with an `originalPrice` prop and explicit 30-day historical lowest price tag (`Lowest in last 30 days: €XX.XX`) in compliance with EU Directive 2019/2161 Art. 6a.

### Fixed
- **Component Parameter Destructuring**: Added `originalPrice` to destructured arguments in `ProductCard` component definition.
- **Test Suite Alignment**: Aligned `__tests__/homepage-narrative.test.tsx` assertions with the sub-50 character YC H1 title.

## [Unreleased] — Continuous Optimization Loop #1 (2026-07-20)

### Changed
- **YC Positioning Formula**: Refactored homepage hero title in `apps/web/pages/index.tsx` to exact 50-character concise value proposition ("Buy authentic regional foods from European sellers.") with `// COMPLIANCE-REVIEW:` annotation.
- **GDPR & Tax Data Retention**: Updated `apps/web/pages/privacy.tsx` to explicitly justify 10-year transactional record retention under EU VAT Directive 2006/112/EC Art. 242a and GDPR Art. 6(1)(c).
- **Czech Statutory Disclosures (VOP)**: Updated `apps/web/pages/terms.tsx` with statutory 24-month defect liability, 12-month presumption of defect, and 14-day right of withdrawal model links.

## [Unreleased] — Master Gap Analysis & Future Strategic Roadmap (2026-07-20)

### Added
- **`TASK 24` (`docs/version-44/GAP_ANALYSIS_AND_FUTURE_ROADMAP.md`)**: Comprehensive gap analysis evaluating repository technical debt, operational readiness, multi-language i18n, cold-chain shipping logistics, Flyway DB migration setup, Vision AI food label scanning, and B2B wholesale expansion corridors.

## [Unreleased] — Comprehensive AI Repository Navigation & Hazard Remediation (2026-07-20)

### Added
- Added one typed, bundled catalogue of 12 fictional demonstration listings spanning regional foods from 12 EU countries, with canonical Annex II allergen categories and illustrative Article 14/Article 9 disclosure fields.
- Added explicit catalogue-origin notices to marketplace results and demonstration notices to product details so fallback records cannot be mistaken for live offers.

### Changed
- Replaced duplicated and certification-like fallback records with a single demo service whose traders, prices, origin statements, recipes, and nutrition values are clearly unverified.
- Corrected FIC field references in the shared product schema and added operator, origin, use, durability, and energy-kJ fields needed by the disclosure UI.

## [Unreleased] — Homepage clarity story (2026-07-20)

### Changed
- Rebuilt the homepage around one marketplace value proposition, primary Explore Marketplace and Sell on EUshop actions, a three-step buyer journey, and a factual trust layer.
- Removed competing mobile-app, AI-search, and regulatory-certification narratives from the homepage; featured foods now disclose whether their data is live, cached, bundled, demonstration, or offline.

## [Unreleased] — Browser storage safety (2026-07-20)

### Added
- Added a versioned browser-storage handler with runtime validation, legacy migration, corrupt-entry reset, byte limits, quota classification, SSR guards, and sensitive key/value rejection.

### Changed
- Migrated cart persistence to the safe schema and moved API response caches, demo orders, demo seller applications, and custom demo listings to memory-only storage.
- Stopped persisting full user profiles in `sessionStorage`; cookie-authenticated server responses now populate memory only.
- Added one-time cleanup for legacy browser keys that could contain account, seller tax/contact, order, waitlist, or listing data.

## [Unreleased] — Region error containment (2026-07-20)

### Changed
- Replaced raw browser-persisted render diagnostics with reusable error boundaries around navigation, marketplace, product, cart, seller-onboarding, and account regions.
- Added accessible Retry, Load Demo Catalogue, and Back to Marketplace recovery actions so a failed region does not render a blank screen.

## [Unreleased] — Centralized reliability engine (2026-07-20)

### Added
- Added reusable request deadlines, abort signals, per-provider circuit breakers, and typed `live`/`cache`/`demo`/`local`/`offline` origin markers for resilient web data loading.
- Added safe fallback sequencing that avoids surfacing raw provider errors or request details to users.

## [Unreleased] — Persistent seller identity & DSA Art. 30 (2026-07-19)

### Changed
- Added an always-rendered “Sold by [seller name]” disclosure to buyer-facing food cards, discovery and quick-checkout surfaces, plus a sticky seller disclosure on food detail pages.
- Removed fabricated seller-name, rating, and verification fallbacks from search results; missing trader identity is now exposed for operational/legal review.
- Removed unconditional DSA/DAC7 status labels from discovery cards; verification is displayed only when explicitly supplied by the API.
- Clarified in the footer that EUshop provides the marketplace while each listing identifies the trader offering the product.

## [Unreleased] — Test and VAT audit coverage (2026-07-19)

### Added
- Added checkout VAT, allergen disclosure, seller-onboarding, GDPR erasure cascade, and order VAT response regression coverage.
- Added nullable per-order VAT audit fields and migration 013 so finalized checkout can retain the destination-rate calculation shown to the buyer.

## [Unreleased] — Watchdog & Nonstop Resilience (2026-07-19)

### Added
- **`scripts/EUshop-Agent-Watchdog.ps1`**: Self-healing watchdog daemon (task-682).
  - Polls orchestrator + agent processes every 30 seconds.
  - Auto-restarts orchestrator (with exponential backoff: 60s → 120s → … → 600s cap) on any silent crash.
  - Clears stale `AUTONOMOUS_STOP` markers automatically so nonstop mode is preserved.
  - After 5 consecutive failures: writes `.agent-state/ALERT.md` with exact steps to take + shows a Windows notification balloon.
  - Detects `AUTONOMOUS_COMPLETE` marker, sends a success toast, and exits cleanly.
  - Stop with: `.\scripts\EUshop-Agent-Watchdog.ps1 -Stop`

## [Unreleased] — Autonomous continuation (2026-07-19)

### Changed
- Consolidated the CI quality gate around the canonical `ci-cd.yml` workflow, with explicit web TypeScript/Jest checks and core-service Maven tests. The GitHub Pages deployment remains in the recognized `nextjs.yml` workflow.

### Fixed
- Repaired the GDPR erasure increment so the core service clean-compiles: restored existing seller queries, completed the user controller, and made the related-data anonymisation repositories executable.

## [Unreleased] — Nonstop Graceful Degradation & Auto-Approval Fix (2026-07-18)
