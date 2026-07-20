# Version 44 Master Execution Queue
# Policy: Non-stop execution with self-recovering graceful degradation (Modes A–I).

## Phase 1 & 2 Core Compliance Tasks (COMPLETED & MERGED TO MAIN)
- [x] TASK 1 — Fix & consolidate CI/CD workflows (`fix/ci-dedup`) [MERGED TO MAIN]
- [x] TASK 2 — Remove mock localStorage auth tokens (`fix/auth-remove-mock-token`) [MERGED TO MAIN]
- [x] TASK 3 — Enforce fail-closed Auth0 session secret (`fix/auth-session-secret`) [MERGED TO MAIN]
- [x] TASK 4 — Wire VAT calculation engine to checkout page (`feat/vat-checkout`) [MERGED TO MAIN]
- [x] TASK 5 — Add GDPR Art. 17 cascading erasure endpoint (`feat/gdpr-erasure`) [MERGED TO MAIN]
- [x] TASK 6 — Expand test coverage with 8+ meaningful unit & integration tests (`test/expand-coverage`) [MERGED TO MAIN]
- [x] TASK 7 — DSA Art. 30 "Sold by" persistent UI element on food pages (`feat/dsa-sold-by`) [MERGED TO MAIN]

## Phase 3 — Version 44 Reliability Architecture & Graceful Degradation (Modes A–I)
- [x] TASK 8 — Centralized Reliability & Degradation Engine (`apps/web/lib/degradation.ts`) — validated at `d456f490`
  - Implement request timeout wrappers (interactive search: 3-5s, product data: 5-8s, auth: 8-12s, payment: 10-15s, background: 15-30s).
  - Implement circuit breaker pattern with origin markers (`live`, `cache`, `demo`, `local`, `offline`).
  - Safe error reporting and fallback state dispatch without leaking sensitive API endpoints or tokens.
  - Branch: `feat/reliability-degradation-engine`

- [ ] TASK 9 — Error Boundaries around Key User Experience Regions (`apps/web/components/common/ErrorBoundary.tsx`)
  - Add React Error Boundaries with graceful fallback UI around Navbar, Marketplace Grid, Product Details, Cart, Seller Onboarding, and Account controls.
  - Provide inline recovery buttons ("Retry", "Load Demo Catalogue", "Back to Marketplace") so zero blank screens or infinite spinners occur.
  - Branch: `feat/error-boundaries`

- [ ] TASK 10 — Local Data Safety & Storage Handler (`apps/web/lib/storageSafety.ts`)
  - Defensive JSON parsing, schema versioning, corrupt data reset, quota handling for `localStorage` and `sessionStorage`.
  - SSR guard (`typeof window === 'undefined'`), never store raw secrets or unencrypted PII.
  - Branch: `fix/storage-safety`

## Phase 4 — Investor-Ready Narrative, Demo Data & Brand Aesthetics
- [ ] TASK 11 — Homepage Rebuild & 5-Second Clarity Story (`apps/web/pages/index.tsx`)
  - Clear 1-sentence value proposition: "EUshop helps people discover and buy authentic regional foods directly from verified European sellers."
  - Rebuilt Hero section with prominent buyer CTA ("Explore Marketplace") and seller CTA ("Sell on EUshop").
  - 3-step "How It Works" visual workflow, authentic Trust Layer (allergen disclosures, DSA trader info, transparent pricing), and zero generic SaaS jargon.
  - Branch: `feat/homepage-investor-narrative`

- [ ] TASK 12 — Bundled Demonstration Catalogue (`apps/web/data/demo-products.ts`)
  - Populate 12 authentic EU regional specialty items (Belgian pralines, Czech spa wafers, Italian pistachio cream, Spanish smoked paprika, French preserves, German marzipan, Greek mountain honey, Polish pierniki, Portuguese sardines, Austrian pumpkin seed oil) with complete FIC Art. 14 allergen & origin metadata.
  - Add subtle "Demonstration catalogue" origin indicator when backend API is unreachable (Mode B fallback).
  - Branch: `feat/bundled-demo-catalogue`

- [ ] TASK 13 — Resilient Image Fallbacks & WCAG 2.2 AA Contrast Polish (`apps/web/components/ui/`)
  - Implement SVG/CSS fallback image renderer for broken or unresolvable product image URLs with stable aspect ratios and regional flag overlays (Mode G).
  - Audit and fix WCAG 2.2 AA contrast ratios, visible focus indicators (`ring-2 ring-primary`), and screen-reader `aria-labels`.
  - Branch: `fix/accessible-image-fallbacks`

## Phase 5 — Functional Seller Onboarding & Feat of Strength
- [ ] TASK 14 — Complete Functional Seller Onboarding Journey (`apps/web/pages/become-seller.tsx`)
  - Multi-step form for business registration, VAT/tax IDs, trade register number, product origin, and allergen responsibilities (DSA Art. 30 data points).
  - Auto-draft preservation in `localStorage` and honest submission preview state with `// COMPLIANCE-REVIEW:` tags.
  - Branch: `feat/seller-onboarding-flow`

- [ ] TASK 15 — "Feat of Strength": Interactive EU Allergen & Origin Filter Engine (`apps/web/components/marketplace/`)
  - Interactive discovery component showing exact 14 EU regulated allergens (Reg. 1169/2011 Annex II) from `packages/compliance/src/allergens.ts`.
  - Instant visual filtering, dietary badges (Organic, PDO/PGI Protected Designation of Origin, Gluten-Free), and explanatory match tooltips.
  - Branch: `feat/allergen-origin-engine`

## Phase 6 — Investor Readiness & Founder Demo Suite
- [ ] TASK 16 — Investor Readiness & Demo Documentation (`docs/version-44/`)
  - `INVESTOR_READINESS.md`: 1-sentence pitch, problem, target market, unit economics, regulatory advantage, 30/60/90-day milestones.
  - `DEMO_SCRIPT.md`: 2-minute founder walkthrough script for Y Combinator / accelerator reviewers.
  - `TEST_REPORT.md` and `KNOWN_LIMITATIONS.md`.
  - `VERSIONS.md`: Full version matrix documenting V44 capabilities, branches, and architecture.
  - Branch: `docs/investor-readiness-suite`

## Phase 7 — Release Gate Verification & Non-Stop Deploy to main
- [ ] TASK 17 — Version 44 Release Gate Reliability Test & Deployment to `main`
  - Execute offline release gate test (backend disabled, AI disabled, auth disabled, payments disabled, images failing).
  - Verify static GitHub Pages build (`pnpm build`).
  - Merge all validated feature branches into `main` and verify GitHub Pages workflow compatibility.
  - Branch: `main`
