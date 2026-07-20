# Version 44 Hermes Recovery Journal

## [2026-07-20 15:40:00 UTC] Task 12: Added demonstration indicator to ProductCard for fallback catalogue
- Modified ProductCard to show a subtle "Demo" badge when the catalogue origin is 'demo' (i.e., when backend API is unreachable).
- Updated ProductCard.tsx to accept an optional origin prop and conditionally render the badge.
- Updated usage in search.tsx and index.tsx to pass the catalogue origin.
- Updated test mocks to accommodate the new prop.

## [2026-07-20 15:30:00 UTC] Task 13: Added image fallback and flag overlay to ProductCard
- Implemented fallback UI for broken product images.
- Added regional flag overlay in the top-right corner of product images.
- Maintains aspect ratio and uses semantic HTML for accessibility.
- Updated ProductCard to use useState for image error handling.

## [2026-07-20 15:00 UTC] Task 12: Corrected image URLs for Dutch and Austrian demo products
- Fixed incorrect image URLs for Dutch Gouda and Austrian pumpkin seed oil in the demonstration catalogue.
- Task 12 requirements remain satisfied.
- Continuing to task 13.

## [2026-07-20 12:14 UTC] Task Roadmap Expanded (23 Tasks Total)
- **Status**: Tasks 1 through 11 completed/validated.
- **Truthfulness Policy & Evidence Gate**: Incorporated 28-section YC Readiness & Truthfulness prompt requirements into active Master Task Queue.
- **Active Task**: Task 12 — Bundled Demonstration Catalogue (`apps/web/data/demo-products.ts`).
- **Next Tasks**:
  12. Task 12: Bundled Demonstration Catalogue (`feat/bundled-demo-catalogue`)
  13. Task 13: Resilient Image Fallbacks & WCAG 2.2 AA Contrast (`fix/accessible-image-fallbacks`)
  14. Task 14: Complete Functional Seller Onboarding (`feat/seller-onboarding-flow`)
  15. Task 15: "Feat of Strength" EU Allergen & Origin Engine (`feat/allergen-origin-engine`)
  16. Task 16: Fact Ledger & Absolute Truthfulness Audit (`docs/truthfulness-fact-ledger`)
  17. Task 17: Asset Provenance & Content Clearance (`docs/asset-provenance-audit`)
  18. Task 18: Legal & Regulatory Review Matrix (`docs/legal-regulatory-matrix`)
  19. Task 19: Security & Privacy Hardening Suite (`security/hardening-review`)
  20. Task 20: Architecture Mapping & Repo Cleanup (`docs/architecture-cleanup`)
  21. Task 21: Investor Readiness & YC Pitch Suite (`docs/yc-investor-readiness`)
  22. Task 22: Founder 2-Minute Demo Script (`docs/founder-demo-script`)
  23. Task 23: Release Gate Offline Test & Deploy to `main`

## [2026-07-20 22:36 UTC] Phase 10 Completed: Navigation, UX & Cart Reliability (Tasks 25-27)
- Task 25: Created reusable Breadcrumb component with Schema.org JSON-LD support, /products/[id] and /category/[slug] routes.
- Task 26: Audited and verified end-to-end cart persistence and checkout flow. Added e2e cart tests.
- Task 27: Fixed search filter allergen handle bug in demo-catalog.ts. All 15 web test suites passing cleanly (88/88 tests).