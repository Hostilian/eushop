# EUshop status

Last verified by direct repository inspection: 2026-07-16. “Implemented” means code exists; it does not mean production-verified, legally approved, or fully tested.

| Area | State | Evidence and limits |
| --- | --- | --- |
| Web | Active, partial | `apps/web/pages` is a Pages Router app. Static builds suppress lint/type failures; some screens use demo/fallback data. |
| Backend | Active, partial | `services/core-service` is the Spring modular monolith on port 3001. Runtime needs PostgreSQL and optional provider configuration. |
| Database | Active, partial | The manifest supports eight migrations through `009_android_device_tokens.sql`; an incompatible rating view and chat drafts are excluded. |
| Mobile | Prototype | Expo screens and EAS configuration exist; a native/store release is unverified. |
| Deployment | Web only | `.github/workflows/nextjs.yml` deploys `apps/web/out` to GitHub Pages, not the API or data services. |
| Compliance | Structural | `packages/compliance` centralizes constants. Human legal/tax review remains mandatory. |

## Mocked, demo, or unverified

- Static versions and fallback content are demonstrations, not production inventory, sellers, ratings, certifications, or availability.
- The opt-in seed is fictional, deterministic, development-only, and leaves its listing inactive.
- Auth0 and Stripe code exists, but end-to-end provider behavior is unverified.
- Redis is provisioned, but active application use is unconfirmed.
- Protected actions and payment confirmation require real backend/provider success and must fail closed.

## Known P0/P1 gaps

- Historical chat migrations and the extended seed target a different schema and cannot safely run.
- No root `pnpm-lock.yaml` is checked in, reducing install reproducibility.
- Web static builds suppress lint and TypeScript build failures.
- Test coverage cannot substantiate production or compliance claims.
- Legal review is outstanding for regulatory behavior, retention, reporting, and jurisdiction-specific tax decisions.

## Planned, not delivered

Verified API hosting; complete Auth0 cutover; confirmed Stripe checkout/payouts; legally reviewed GDPR, DSA, DAC7, and VAT workflows; and verified signed mobile distribution.

See `docs/architecture/runtime.md` and `DEVELOPMENT.md`.
