# EUshop Version 44 Master Execution Queue

## Phase 1 — Infrastructure, Auth & CI/CD Consolidation
- [x] TASK 1 - Fix & consolidate CI/CD workflows (`fix/ci-dedup`) [MERGED TO MAIN]
- [x] TASK 2 - Remove mock localStorage auth tokens (`fix/auth-remove-mock-token`) [MERGED TO MAIN]
- [x] TASK 3 - Enforce fail-closed Auth0 session secret (`fix/auth-session-secret`) [MERGED TO MAIN]

## Phase 2 — Regulatory Engine & Core Compliance Integration
- [x] TASK 4 - Wire VAT calculation engine to checkout page (`feat/vat-checkout`) [MERGED TO MAIN]
- [x] TASK 5 - Add GDPR Art. 17 cascading erasure endpoint (`feat/gdpr-erasure`) [MERGED TO MAIN]
- [x] TASK 6 - Expand test coverage with 8+ meaningful unit & integration tests (`test/expand-coverage`) [MERGED TO MAIN]
- [x] TASK 7 - DSA Art. 30 "Sold by" persistent UI element on food pages (`feat/dsa-sold-by`) [MERGED TO MAIN]

## Phase 3 — Centralized Degradation Engine & UI Reliability
- [x] TASK 8 - Centralized Reliability & Degradation Engine (`apps/web/lib/degradation.ts`) [MERGED TO MAIN]
- [x] TASK 9 - Error Boundaries around Key User Experience Regions (`apps/web/components/common/ErrorBoundary.tsx`) [MERGED TO MAIN]
- [x] TASK 10 - Local Data Safety & Storage Handler (`apps/web/lib/storageSafety.ts`) [MERGED TO MAIN]

## Phase 4 — Investor-Ready Narrative, Demo Data & Brand Aesthetics
- [x] TASK 11 - Homepage Rebuild & 5-Second Clarity Story (`apps/web/pages/index.tsx`) [MERGED TO MAIN]
- [x] TASK 12 - Bundled Demonstration Catalogue (`apps/web/data/demo-products.ts`) [MERGED TO MAIN]
- [x] TASK 13 - Resilient Image Fallbacks & WCAG 2.2 AA Contrast Polish (`apps/web/components/ui/`) [MERGED TO MAIN]

## Phase 5 — Functional Seller Onboarding & Feat of Strength
- [x] TASK 14 - Complete Functional Seller Onboarding Journey (`apps/web/pages/become-seller.tsx`) [MERGED TO MAIN]
- [x] TASK 15 - "Feat of Strength": Interactive EU Allergen & Origin Filter Engine (`apps/web/components/marketplace/`) [MERGED TO MAIN]

## Phase 6 — Absolute Truthfulness Audit & Provenance Verification
- [x] TASK 16 - Fact Ledger & Absolute Truthfulness Audit (`docs/evidence/FACT_LEDGER.md`) [MERGED TO MAIN]
- [x] TASK 17 - Asset Provenance & Third-Party Content Clearance (`docs/agent/ASSET_PROVENANCE.md`) [MERGED TO MAIN]

## Phase 7 — Legal, Security & Architecture Audit Suite
- [x] TASK 18 - Legal & Regulatory Review Matrix (`docs/agent/LEGAL_REVIEW_REQUIRED.md`) [MERGED TO MAIN]
- [x] TASK 19 - Security & Privacy Hardening Suite (`docs/agent/SECURITY_REVIEW.md`) [MERGED TO MAIN]
- [x] TASK 20 - Architecture Mapping & Repository Cleanup (`docs/architecture/CURRENT_ARCHITECTURE.md`) [MERGED TO MAIN]

## Phase 8 — YC Pitch Suite, Demo Walkthrough & Release Gate
- [x] TASK 21 - Investor Readiness & YC Pitch Suite (`docs/version-44/INVESTOR_READINESS.md`) [MERGED TO MAIN]
- [x] TASK 22 - Founder 2-Minute Demo Script (`docs/version-44/DEMO_SCRIPT.md`) [MERGED TO MAIN]
- [x] TASK 23 - Version 44 Release Gate Reliability Test & Deployment to `main` [MERGED TO MAIN]