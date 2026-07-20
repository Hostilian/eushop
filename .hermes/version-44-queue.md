# Version 44 Master Execution Queue
# Policy: Non-stop execution with self-recovering graceful degradation (Modes A-I) and Absolute Truthfulness Policy.

## Phase 1 & 2 Core Compliance Tasks (COMPLETED & MERGED TO MAIN)
- [x] TASK 1 - Fix & consolidate CI/CD workflows (`fix/ci-dedup`) [MERGED TO MAIN]
- [x] TASK 2 - Remove mock localStorage auth tokens (`fix/auth-remove-mock-token`) [MERGED TO MAIN]
- [x] TASK 3 - Enforce fail-closed Auth0 session secret (`fix/auth-session-secret`) [MERGED TO MAIN]
- [x] TASK 4 - Wire VAT calculation engine to checkout page (`feat/vat-checkout`) [MERGED TO MAIN]
- [x] TASK 5 - Add GDPR Art. 17 cascading erasure endpoint (`feat/gdpr-erasure`) [MERGED TO MAIN]
- [x] TASK 6 - Expand test coverage with 8+ meaningful unit & integration tests (`test/expand-coverage`) [MERGED TO MAIN]
- [x] TASK 7 - DSA Art. 30 "Sold by" persistent UI element on food pages (`feat/dsa-sold-by`) [MERGED TO MAIN]

## Phase 3 — Version 44 Reliability Architecture & Graceful Degradation (COMPLETED)
- [x] TASK 8 - Centralized Reliability & Degradation Engine (`apps/web/lib/degradation.ts`) [VALIDATED 5904e37c]
- [x] TASK 9 - Error Boundaries around Key User Experience Regions (`apps/web/components/common/ErrorBoundary.tsx`) [VALIDATED ad8a0e36]
- [x] TASK 10 - Local Data Safety & Storage Handler (`apps/web/lib/storageSafety.ts`) [VALIDATED 252dd93c]

## Phase 4 — Investor-Ready Narrative, Demo Data & Brand Aesthetics
- [x] TASK 11 - Homepage Rebuild & 5-Second Clarity Story (`apps/web/pages/index.tsx`) [VALIDATED 2cff9579]
- [x] TASK 12 - Bundled Demonstration Catalogue (`apps/web/data/demo-products.ts`) [VALIDATED 6ec926a2]
  - Populate 12 authentic EU regional specialty items (Belgian pralines, Czech spa wafers, Italian pistachio cream, Spanish smoked paprika, French preserves, German marzipan, Greek mountain honey, etc.) with complete FIC Art. 14 allergen & origin metadata.
  - Add subtle "Demonstration catalogue" origin indicator when backend API is unreachable (Mode B fallback).
  - Branch: `feat/bundled-demo-catalogue`

- [x] TASK 13 - Resilient Image Fallbacks & WCAG 2.2 AA Contrast Polish (`apps/web/components/ui/`) [VALIDATED c1b43e67]
  - Implement SVG/CSS fallback image renderer for broken product URLs with stable aspect ratios and regional flag overlays (Mode G).
  - Audit and fix WCAG 2.2 AA contrast ratios, visible focus indicators (`ring-2 ring-primary`), and screen-reader `aria-labels`.
  - Branch: `fix/accessible-image-fallbacks`

## Phase 5 — Functional Seller Onboarding & Feat of Strength
- [ ] TASK 14 - Complete Functional Seller Onboarding Journey (`apps/web/pages/become-seller.tsx`)
  - Multi-step form for business registration, VAT/tax IDs, trade register number, product origin, and allergen responsibilities (DSA Art. 30 data points).
  - Auto-draft preservation in `localStorage` and honest submission preview state with `// COMPLIANCE-REVIEW:` tags.
  - Branch: `feat/seller-onboarding-flow`

- [ ] TASK 15 - "Feat of Strength": Interactive EU Allergen & Origin Filter Engine (`apps/web/components/marketplace/`)
  - Interactive discovery component showing exact 14 EU regulated allergens (Reg. 1169/2011 Annex II) from `packages/compliance/src/allergens.ts`.
  - Instant visual filtering, dietary badges (Organic, PDO/PGI Protected Designation of Origin, Gluten-Free), and explanatory match tooltips.
  - Branch: `feat/allergen-origin-engine`

## Phase 6 — Truthfulness Policy, Fact Ledger & Audit Suite
- [ ] TASK 16 - Fact Ledger & Absolute Truthfulness Audit (`docs/evidence/FACT_LEDGER.md`)
  - Audit every public claim against working code.
  - Remove/qualify all unverified claims ("fully compliant", "play protect certified", "thousands of customers").
  - Create evidence-backed status markers (`VERIFIED`, `DEMO`, `PLANNED`, `NEEDS OWNER INPUT`).
  - Branch: `docs/truthfulness-fact-ledger`

- [ ] TASK 17 - Asset Provenance & Third-Party Content Clearance (`docs/agent/ASSET_PROVENANCE.md`)
  - Audit all images, logos, icons, fonts, and archived site assets for copyright clearance.
  - Quarantine/remove scraped third-party imagery; enforce SVG/CSS fallbacks with regional origin markers.
  - Branch: `docs/asset-provenance-audit`

- [ ] TASK 18 - Legal & Regulatory Review Matrix (`docs/agent/LEGAL_REVIEW_REQUIRED.md`)
  - Categorize technical controls vs. required operational processes for GDPR, DSA, Consumer Rights Directive, DAC7, and FIC Reg 1169/2011.
  - Branch: `docs/legal-regulatory-matrix`

- [ ] TASK 19 - Security & Privacy Hardening Suite (`docs/agent/SECURITY_REVIEW.md`)
  - Conduct security review for XSS, open redirects, CORS, session cookie flags, JWT validation, and environment secret leaks.
  - Branch: `security/hardening-review`

- [ ] TASK 20 - Architecture Mapping & Repository Cleanup (`docs/architecture/CURRENT_ARCHITECTURE.md`)
  - Document active vs. inactive packages, dependencies, and build pipelines.
  - Clean up dead code, scratch files, and broken endpoints.
  - Branch: `docs/architecture-cleanup`

## Phase 7 — YC Investor Readiness & Founder Demo Suite
- [ ] TASK 21 - Investor Readiness & YC Pitch Suite (`docs/version-44/INVESTOR_READINESS.md`)
  - 1-sentence pitch, problem, target users, market wedge, supply/demand hypotheses, competitive defensibility, 30/60/90-day milestones.
  - Branch: `docs/yc-investor-readiness`

- [ ] TASK 22 - Founder 2-Minute Demo Script (`docs/version-44/DEMO_SCRIPT.md`)
  - Step-by-step founder script for Y Combinator / accelerator reviewers.
  - Branch: `docs/founder-demo-script`

## Phase 8 — Release Gate Verification & Non-Stop Deploy to main
- [ ] TASK 23 - Version 44 Release Gate Reliability Test & Deployment to `main`
  - Execute offline release gate test (backend disabled, AI disabled, auth disabled, payments disabled, images failing).
  - Verify static GitHub Pages build (`pnpm build`) with `/eushop/` base-path.
  - Merge all validated feature branches into `main` and deploy to GitHub Pages (`origin/main`).
  - Create `.claude/AUTONOMOUS_COMPLETE`.
  - Branch: `main`