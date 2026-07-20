# Changelog

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
