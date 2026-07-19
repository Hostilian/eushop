# Version 44 Autonomous Master Execution Queue
# Policy: Non-stop execution with self-recovering graceful degradation.

## Phase 1 & 2 Core Compliance Tasks (Currently Completing)
- [x] TASK 1 — Fix & consolidate CI/CD workflows (`fix/ci-dedup`) [MERGED TO MAIN]
- [x] TASK 2 — Remove mock localStorage auth tokens (`fix/auth-remove-mock-token`) [MERGED TO MAIN]
- [x] TASK 3 — Enforce fail-closed Auth0 session secret (`fix/auth-session-secret`) [MERGED TO MAIN]
- [x] TASK 4 — Wire VAT calculation engine to checkout page (`feat/vat-checkout`) [MERGED TO MAIN]
- [/] TASK 5 — Add GDPR Art. 17 cascading erasure endpoint (`feat/gdpr-erasure`) [IN PROGRESS]
- [ ] TASK 6 — Expand test coverage with 8+ meaningful unit & integration tests (`test/expand-coverage`)
- [ ] TASK 7 — DSA Art. 30 "Sold by" persistent UI element on food pages (`feat/dsa-sold-by`)

## Phase 3 — Version 44 Reliability Architecture & Graceful Degradation (Modes A–I)
- [ ] TASK 8 — Centralized Reliability & Degradation Engine (`apps/web/lib/degradation.ts`)
  - Implement request timeout wrappers, circuit breakers, and status origin markers (`live`, `cache`, `demo`, `local`, `offline`).
  - Ensure zero unhandled exceptions or blank screens when any backend, API, or external service fails.
  - Branch: `feat/reliability-degradation-engine`
- [ ] TASK 9 — Error Boundaries around Key User Experience Regions (`apps/web/components/common/ErrorBoundary.tsx`)
  - Add React Error Boundaries with graceful fallback UI around Navbar, Marketplace Grid, Product Details, Cart, Seller Onboarding, and Account controls.
  - Branch: `feat/error-boundaries`
- [ ] TASK 10 — Local Data Safety & Storage Handler (`apps/web/lib/storageSafety.ts`)
  - Defensive JSON parsing, schema versioning, and fallback handling for malformed `localStorage` data. Never store raw secrets or unencrypted PII.
  - Branch: `fix/storage-safety`

## Phase 4 — Investor-Ready Narrative, Demo Data & Design Polish
- [ ] TASK 11 — Homepage Rebuild & 5-Second Clarity Story (`apps/web/pages/index.tsx`)
  - Clear 1-sentence value proposition: "EUshop helps people discover and buy authentic regional foods directly from verified European sellers."
  - Rebuilt Hero with buyer CTA and seller CTA. 3-step "How It Works" and honest Trust Layer.
  - Branch: `feat/homepage-investor-narrative`
- [ ] TASK 12 — Bundled Demonstration Catalogue (`apps/web/data/demo-products.ts`)
  - Populate 12 authentic EU regional specialty items (Belgian pralines, Czech spa wafers, Italian pistachio cream, Spanish smoked paprika, French preserves, etc.) with complete FIC Art. 14 allergen & origin metadata.
  - Add subtle "Demonstration catalogue" badges when backend API is unreachable (Mode B).
  - Branch: `feat/bundled-demo-catalogue`
- [ ] TASK 13 — Resilient Image Fallbacks & WCAG 2.2 AA Contrast Polish (`apps/web/components/ui/`)
  - Implement fallback image handler for broken product URLs with stable aspect ratios (Mode G).
  - Ensure accessible contrast ratios, visible focus rings, and screen-reader labels across all components.
  - Branch: `fix/accessible-image-fallbacks`

## Phase 5 — Functional Seller Onboarding & Feat of Strength
- [ ] TASK 14 — Complete Functional Seller Onboarding Journey (`apps/web/pages/become-seller.tsx`)
  - Multi-step form for business registration, VAT/tax IDs, trade register number, product origin, and allergen responsibilities.
  - Draft preservation in `localStorage` and honest submission preview state.
  - Branch: `feat/seller-onboarding-flow`
- [ ] TASK 15 — "Feat of Strength": Interactive EU Allergen & Origin Filter Engine (`apps/web/components/marketplace/`)
  - Interactive discovery component showing exact 14 EU allergens (Reg. 1169/2011 Annex II) with visual indicators and clear filtering explanations.
  - Branch: `feat/allergen-origin-engine`

## Phase 6 — Documentation, Hermes Recovery Journal & Release Gate
- [ ] TASK 16 — Continuous Hermes Recovery Journal Updates (`.hermes/`)
  - Keep `.hermes/version-44-state.json`, `version-44-journal.md`, `version-44-queue.md`, and `version-44-failures.md` synchronized after every validated commit.
  - Branch: `docs/hermes-recovery-journal`
- [ ] TASK 17 — Investor Readiness & Demo Documentation (`docs/version-44/`)
  - Create `INVESTOR_READINESS.md` (1-sentence pitch, problem, target market, unit economics, regulatory advantage, milestones).
  - Create `DEMO_SCRIPT.md` (2-minute founder walkthrough guide).
  - Create `TEST_REPORT.md` and `KNOWN_LIMITATIONS.md`.
  - Branch: `docs/investor-readiness-suite`
- [ ] TASK 18 — Version 44 Release Gate Reliability Test & Non-Stop Merge to `main`
  - Run offline test scenario (backend disabled, AI disabled, auth disabled, payments disabled, images failing).
  - Confirm static GitHub Pages export builds cleanly (`pnpm build`).
  - Merge all completed feature branches into `main` and push to GitHub Pages (`origin/main`).
  - Create `.claude/AUTONOMOUS_COMPLETE`.
  - Branch: `main`
