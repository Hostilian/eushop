# Changelog

## [Unreleased] — Bundled demonstration catalogue (2026-07-20)

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
