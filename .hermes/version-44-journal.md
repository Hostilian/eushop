# Version 44 Hermes Recovery Journal

## [2026-07-20 12:01 UTC] Task 10 validated
- **Branch/commit**: `fix/storage-safety` at `252dd93c`.
- **Delivered**: versioned/validated storage envelopes, corrupt reset, migrations, quotas, SSR guards, sensitive-data rejection, and safe cart persistence.
- **Data minimisation**: account profiles, API caches, demo orders, seller tax/contact applications, custom listings, and waitlist records are no longer persisted in modern browser code; known legacy keys are purged once at startup.
- **Compliance review**: client cleanup is defence in depth and does not replace server-side GDPR retention/erasure, DSA KYBC evidence, or DAC7 recordkeeping. Server records are unaffected.
- **Verification**: TypeScript passed; 12 Jest suites / 82 tests passed; ESLint passed with zero errors and three pre-existing image warnings.
- **Preserved unrelated state**: untracked `scripts/Get-Progress.ps1` was not modified or committed.
- **Next**: Task 11 on `feat/homepage-investor-narrative`.

## [2026-07-20 11:48 UTC] Task 9 validated
- **Branch/commit**: `feat/error-boundaries` at `ad8a0e36`.
- **Delivered**: region-aware boundaries for navigation, marketplace, product details, cart/checkout, seller onboarding, account controls, and a final page-level containment layer.
- **Recovery UI**: Retry, Load Demo Catalogue, and Back to Marketplace; route changes reset failed regions.
- **Data/compliance review**: removed raw render-error persistence and unverified seller claims from global metadata; no new user, food, or order data path was added and no compliance certification is asserted.
- **Verification**: TypeScript passed; 11 Jest suites / 77 tests passed; ESLint passed with zero errors and three pre-existing image warnings.
- **Next**: Task 10 on `fix/storage-safety`.

## [2026-07-20 11:42 UTC] Task 8 validated
- **Branch**: `feat/reliability-degradation-engine`
- **Commit**: `d456f490` (following initial implementation `5904e37c`)
- **Delivered**: abortable timeout presets, keyed circuit breakers, safe fallback sequencing, and typed `live`/`cache`/`demo`/`local`/`offline` origin results exposed by food services.
- **Compliance/data safety**: raw provider errors and raw search text are not persisted or exposed; this change implements reliability structure and makes no legal-compliance claim.
- **Verification**: web TypeScript passed; 10 Jest suites / 74 tests passed; ESLint passed with zero errors and three pre-existing `<img>` warnings.
- **Next**: Task 9 on `feat/error-boundaries`.

## [2026-07-20 11:15 UTC] Session Continuation
- **Status**: Tasks 1 through 7 completed and merged into `main` (SHA `f44eedaa`).
- **Watchdog**: `scripts/EUshop-Agent-Watchdog.ps1` installed and committed.
- **Active Task**: Task 8 — Centralized Reliability & Degradation Engine (`apps/web/lib/degradation.ts`).
- **Next Tasks**:
  1. Task 8: `feat/reliability-degradation-engine`
  2. Task 9: `feat/error-boundaries`
  3. Task 10: `fix/storage-safety`
  4. Task 11: `feat/homepage-investor-narrative`
  5. Task 12: `feat/bundled-demo-catalogue`
  6. Task 13: `fix/accessible-image-fallbacks`
  7. Task 14: `feat/seller-onboarding-flow`
  8. Task 15: `feat/allergen-origin-engine`
  9. Task 16: `docs/investor-readiness-suite`
  10. Task 17: Release Gate & deploy to `main`
