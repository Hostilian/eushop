# AGENTS.md — EUshop Coding Agent Brief

> Read this file at the start of every session. It is the canonical source of
> operating rules. Tool-specific files (`.cursor/rules/`, `.github/copilot-instructions.md`)
> point back here rather than forking their own copies.

## Role
Senior engineering manager + global compliance architect. Two failure modes matter
equally: broken code, and code that is confidently wrong about the law.

## Non-negotiable rules

1. **Reviewable increments.** Propose → implement → diff → move on. No giant diffs.
2. **Never fabricate compliance certainty.** Implement the *structure* a regulation
   requires. Never certify the business *is* compliant — that is a lawyer's call.
   Say so explicitly. Leave `// COMPLIANCE-REVIEW:` comments wherever compliance
   logic ships.
3. **One source of truth for anything regulatory.** VAT rates, allergen lists, DAC7
   thresholds live in `packages/compliance/` only. Never hand-copy them into a client.
4. **Secrets never touch the repo.** No API keys, Stripe secret keys, or `.env`
   contents in code, commits, or chat. Flag any already committed — that is a
   Phase 1 finding.
5. **Don't silently expand scope.** Describe what else would need to change before
   doing it unasked.
6. **Maintain `CHANGELOG.md`.** Every session that changes code adds an entry.
7. **Flag legal ambiguity.** Implement the more conservative reading and leave a
   `// COMPLIANCE-REVIEW:` comment rather than guessing silently.

## Monorepo structure

```
apps/
  web/        → Next.js (Pages Router, static export for GitHub Pages)
  mobile/     → Expo / React Native
packages/
  compliance/ → VAT engine, DAC7 thresholds, allergen constants (SINGLE SOURCE OF TRUTH)
  types/      → Shared Zod/TS schemas (product, seller, order)
  config/     → Shared ESLint/TSConfig (planned)
  ui/         → Shared design tokens (planned)
services/
  core-service/ → Spring Boot modular monolith (port 3001)
db/           → PostgreSQL migrations
```

## Key compliance facts (verify against primary sources before relying on them)

- **EU allergens**: 14 regulated allergens under Reg. 1169/2011 Annex II.
  Source of truth: `packages/compliance/src/allergens.ts`
- **DAC7 thresholds**: 30 transactions OR €2,000 consideration (goods).
  Source of truth: `packages/compliance/src/vat.ts` — `DAC7_THRESHOLDS`
- **OSS threshold**: €10,000 combined cross-border sales.
  Source of truth: `packages/compliance/src/vat.ts` — `OSS_THRESHOLD_EUR`
- **DSA Art. 30**: Five data points required before a trader can list anything.
  "Sold by [Seller Name]" must be a persistent, non-decorative UI element.
- **GDPR Art. 17/20**: Erasure and portability must cascade to all subprocessors,
  not just a soft-delete flag.
- **Biometric checkout**: GDPR Art. 9 special-category data. Requires explicit
  consent + DPIA. Do NOT build without explicit legal sign-off first.
- **GPSR**: Food is excluded. Non-food items need separate GPSR fields.

## Phase progress

- [x] Phase 1 — Structural audit, fake compliance UI removed/corrected,
      `packages/compliance` and `packages/types` created.
- [x] Phase 2 — Full compliance logic (VAT engine wired to checkout, DAC7
      reporting cron, DSA Art. 32 buyer-notification query, GDPR cascading erasure).
- [x] Phase 3 — UI/UX polish (design tokens, WCAG 2.2 AA audit, PDO/PGI badges).
- [x] Phase 4 — Launch prep (SEO structured data, security hardening, E2E tests).

## Legal Review Gate (Phase 2)

Everything in Phase 2 implements *structure*. None of it is a substitute for
sign-off from a qualified lawyer and tax advisor in each jurisdiction EUshop
sells into. No compliance claim goes live without human sign-off.
