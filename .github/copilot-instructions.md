# EUshop — GitHub Copilot Instructions

Full brief: see [`AGENTS.md`](../../AGENTS.md) at the repo root.

## Quick reference

**Stack:** Next.js (Pages Router, `apps/web`) + Expo (`apps/mobile`) + Spring Boot (`services/core-service`)

**Critical rules:**
1. VAT rates, allergen lists, and DAC7 thresholds come from `packages/compliance/` only — never hardcode them.
2. Shared product/seller/order types come from `packages/types/` only.
3. Leave `// COMPLIANCE-REVIEW:` on any line implementing regulatory logic.
4. "Sold by [Seller Name]" must be a persistent, non-decorative UI element on every product and cart line (DSA Art. 30(7)).
5. `AllergenBadge` must always include `aria-label` — never colour alone (WCAG 1.4.1).
6. No secrets in code. No fake compliance badges. No unverified compliance claims in copy.
