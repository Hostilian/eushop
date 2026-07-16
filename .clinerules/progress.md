# EUshop — Cline Memory Bank

> Cline re-reads this file at the start of every session.
> Keep it current. Archive completed phases to CHANGELOG.md.

## Active Phase: Phase 2 → Phase 3

## What Was Done (Phase 1 — COMPLETE)

- Created `packages/compliance/` — single source of truth for VAT rates,
  DAC7 thresholds, EU 14 allergens, FDA 9 allergens. Unit tests included.
- Created `packages/types/` — shared Zod schemas for Product (FIC Art.14),
  Seller (DSA Art.30), Order.
- Removed all fake compliance claims from `_app.tsx`, `ZeroStepCheckout.tsx`,
  `index.tsx`, `become-seller.tsx`, `checkout.tsx`, `search.tsx`.
- Fixed AllergenBadge WCAG 1.4.1 violation (added aria-label).
- Fixed search empty state copy (now actionable).
- Created `AGENTS.md`, `.cursor/rules/` (4 MDC files), `.github/copilot-instructions.md`.
- Added `packages/*` to `pnpm-workspace.yaml`.

## What Was Done (Phase 2 partial — COMPLETE)

- Rewrote `food/[id].tsx` with full FIC Art.14 pre-purchase disclosure block,
  DSA Art.30(7) "Sold by" element, WCAG allergen display, JSON-LD structured data.
- Created `legal/privacy-policy.md`, `legal/cookie-policy.md`, `legal/terms.md`,
  `legal/refund-policy.md` — all marked as drafts for counsel review.
- Created `docs/compliance/data-flow.md` — Mermaid diagrams for system
  architecture, personal data flow, compliance code paths, incident runbooks.
- Created `docs/compliance/seo-marketing.md` — JSON-LD examples, KPIs, content calendar.
- Created `docs/compliance/testing-plan.md` — P0/P1/P2 test cases.
- Created `.github/workflows/ci-cd.yml` — enhanced pipeline with compliance
  tests (blocking), Lighthouse CI, axe-core, security scan, secret detection.
- Created `apps/web/public/robots.txt` and `scripts/generate-sitemap.js`.

## What Still Needs Doing

### Phase 2 (compliance logic — backend)
- [ ] DAC7 reporting cron job (Spring Boot `services/core-service`)
- [ ] VIES VAT number lookup integration for KYBC verification
- [ ] DSA Art.32 buyer-notification query ("who bought X in last 6 months")
- [ ] GDPR cascading erasure to Stripe + Auth0 subprocessors
- [ ] VAT engine wired to `checkout.tsx` `formData.country` (replace 0.15 placeholder)
- [ ] OSS threshold counter per seller (running annual total)

### Phase 3 (UI/UX)
- [ ] `packages/ui/` design tokens (colors, typography) — artisanal food vocabulary
- [ ] `packages/ui/` NativeWind token bridge for mobile
- [ ] PDO/PGI/TSG badge component (only renders when qualitySchemeVerified=true)
- [ ] "Sold by" element on ProductCard (currently only on food detail page)
- [ ] Locale-aware number/date/currency formatting
- [ ] Language selector (persistent, not geo-IP-guessed)
- [ ] `prefers-reduced-motion` respect in animations
- [ ] Skip-to-content link in PageWrapper

### Phase 4 (launch prep)
- [ ] GA4 Analytics component wired into `_app.tsx`
- [ ] JSON-LD Organisation schema in `_app.tsx`
- [ ] `sitemap.xml` generated and committed to `public/`
- [ ] Playwright E2E tests for checkout flow
- [ ] Manual VoiceOver + TalkBack testing (checkout + allergen filters)
- [ ] CSP headers (via `next.config.js` headers or Cloudflare)
- [ ] `next.config.js`: remove `ignoreBuildErrors: true` and `ignoreDuringBuilds: true`

## Key Decisions Made

- VAT rates live in `packages/compliance/src/vat.ts` only — never hardcoded in components
- DAC7 thresholds are named constants (`DAC7_THRESHOLDS`) — configurable for 2028 reform
- ZeroStepCheckout is a "quick add to cart" flow, not a payment flow — real payment at checkout
- Biometric checkout is gated pending GDPR Art.9 DPIA — do not build without legal sign-off
- `next.config.js` uses `output: 'export'` for GitHub Pages — Pages Router, not App Router
- Compliance tests are blocking in CI — `continue-on-error: false` always

## COMPLIANCE-REVIEW Items Outstanding

- `checkout.tsx`: VAT rate is `0.15` placeholder — wire to `getFoodVatRate(formData.country)`
- `ZeroStepCheckout.tsx`: VAT uses `getFoodVatRate('DE')` placeholder — needs real destination country
- `packages/compliance/src/vat.ts`: All rates need tax advisor verification before production
- `packages/compliance/src/allergens.ts`: Verify against current Annex II text before launch
- `legal/*.md`: All legal templates need counsel review before publication
- `food/[id].tsx`: FIC Art.14 block shows "not available" for missing fields — seller must be required to fill them
