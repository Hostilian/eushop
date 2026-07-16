# Changelog

## Unreleased — 2026-07-16 truth and setup reliability

- Reconciled scoped documentation with active web, backend, mobile, database, and GitHub Pages paths.
- Standardized local ports/defaults and added setup preflight diagnostics.
- Replaced semicolon-splitting migrations with a checksummed, manifest-driven, lock-protected transactional runner with bounded connection timeout.
- Excluded incompatible chat drafts from standard migrations while preserving them for redesign and compliance review.
- Made development fixtures opt-in, transactional, deterministic, fictional, and inactive by default; added focused setup tests.

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] — Phase 1 Master Agent Pass

### Added
- **`packages/compliance/`** — Single source of truth for all regulatory logic.
  - `allergens.ts`: EU 14-allergen list (Reg. 1169/2011 Annex II) and FDA 9-allergen list (FALCPA + FASTER Act) as `as const` arrays with `// COMPLIANCE-REVIEW:` citations.
  - `vat.ts`: `getFoodVatRate()` per EU member state, `isDAC7Reportable()`, `requiresOssReporting()`, `DAC7_THRESHOLDS` and `OSS_THRESHOLD_EUR` as configurable named constants (not magic numbers).
  - `__tests__/compliance.test.ts`: Fixture tests for DAC7 edge cases (29/30/31 transactions, €1,999/€2,000/€2,001), VAT rates per country (DE, IE, DK, MT, FR), unknown-country fallback, and allergen list integrity.
- **`packages/types/`** — Shared Zod schemas for `Product`, `Seller`, `Order` with full FIC Art. 14 fields, DSA Art. 30 KYBC fields, and `productType` flag for GPSR code path.
- **`AGENTS.md`** — Root canonical agent brief (tool-agnostic, read by Cursor/Cline/Copilot).
- **`.cursor/rules/architecture.mdc`** — Monorepo structure rules.
- **`.cursor/rules/compliance.mdc`** — Compliance logic rules scoped to relevant globs.
- **`.cursor/rules/ui.mdc`** — UI/UX and accessibility rules.
- **`.cursor/rules/launch.mdc`** — Launch prep, security, and testing rules.
- **`.github/copilot-instructions.md`** — Copilot repo-wide instructions pointing to `AGENTS.md`.
- **`.github/instructions/compliance.instructions.md`** — Path-scoped Copilot rules for `packages/compliance/`.
- **`.github/instructions/mobile.instructions.md`** — Path-scoped Copilot rules for `apps/mobile/`.

### Fixed (Phase 1.0 — fake/unsubstantiated compliance UI)
- **`_app.tsx`**: Removed `"DSA-compliant, VAT-transparent, allergen-disclosed"` from `og:description` meta tag — unsubstantiated compliance claim under EU Unfair Commercial Practices Directive.
- **`ZeroStepCheckout.tsx`**: Removed hardcoded `Müllerstraße 42, 10115 Berlin` shipping address. Removed `"EU-Wallet Gateway"` and `"Authorizing OSS Tax Ledger"` fake-terminal copy. Wired VAT rate to `getFoodVatRate('DE')` from compliance package (with `// COMPLIANCE-REVIEW:` placeholder note). Fixed double-comma syntax error in `orderAPI.create` call. Fixed success state copy from `"Order confirmed. A webhook was dispatched to the Spring Core monolith"` to honest `"Added to cart. Go to cart to complete payment"`.
- **`Badge.tsx` / `AllergenBadge`**: Added `aria-label="Contains allergen: {allergen}"` and `aria-hidden="true"` on warning icon — fixes WCAG 1.4.1 violation (colour/icon alone, no text alternative for screen readers).
- **`checkout.tsx`**: Labelled hardcoded `0.15` VAT multiplier as a placeholder with `// COMPLIANCE-REVIEW:` comment. Replaced `"VAT & Processing (15%)"` label with `"VAT (rate by destination country)"`.
- **`search.tsx`**: Replaced non-actionable empty state `"No foods found for the current query or filters"` with `"No results match your filters — try removing a filter"`.
- **`index.tsx`**: Removed `"KYBC seller onboarding"` jargon from hero paragraph. Added `aria-hidden="true"` to decorative emoji in compliance section.
- **`become-seller.tsx`**: Replaced static green ticks in seller dashboard compliance panel with data-driven indicators driven by `user.kycVerified` and `user.taxId` fields.

### Changed
- **`pnpm-workspace.yaml`**: Added `packages/*` so `@eushop/compliance` and `@eushop/types` are resolved as workspace packages.

## [0.1.0] - 2026-07-07

### Added
- **Spring Security Configuration**: Implemented centralized CORS registry whitelisting specific development and production origins instead of global wildcards (`*`).
- **Auth0 JWT Authentication**: Added filter to intercept, parse, and cryptographically verify RS256 JWT signatures against the Auth0 JWKS endpoint in production.
- **Request Header Spoof Protection**: Added security wrapper to strip client-provided `X-User-*` headers at the ingress filter level.
- **Correlation ID / Stripe Idempotency**: Configured `X-Correlation-ID` header forwarding to Stripe's `Idempotency-Key` when creating PaymentIntents.
- **Stripe Webhook Deduplication**: Implemented a `processed_webhook_events` Postgres table to deduplicate incoming webhook events and prevent double-processing.
- **Controller Test Suite**: Added `SecurityAndControllerTest.java` verifying CORS, secure gates, mock auth, and Stripe webhook flows using MockMvc.
- **GDPR Compliance Audits**: Created `COMPLIANCE_GAPS.md` mapping alignment with GDPR Article 17 (Right to Erasure), Article 20 (Portability), DSA KYBC seller vetting, DAC7 tax intakes, and EU Food Regulation 1169/2011.
- **Workspace Security Policy**: Added `SECURITY.md` detailing security architecture, secrets management, and private vulnerability reporting.

### Changed
- **GDPR Consent Data Minimization**: Removed raw PII columns (`ipAddress`, `userAgent`, `consentSource`, `version`, `auditNotes`) from the Hibernate `ConsentLog.java` entity, matching database schema migrations storing only SHA-256 hashes.
- **Performance Optimizations (N+1)**: Configured JPA `@EntityGraph` fetch joins in `FoodRepository` and `OrderRepository` to eliminate lazy-loading database round-trips for parent entities.
- **Mock Authentication Firewall**: Locked Next.js local simulated sessions behind a runtime environment check, failing secure and throwing network errors in production builds.

### Removed
- **Exclusion Zone Files**: Permanently deleted stray key harvesting daemons, local key pools, parallel chat scripts, and temporary credentials files.
- **Duplicate Workflows**: Consolidated CI configuration by deleting `ci-cd-pipeline.yml` and obsolete workflow files.
- **Retired Service Artifacts**: Moved retired node `services/api-gateway` to `archive/services/api-gateway`.
