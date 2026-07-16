# Agent report: 01-truth-setup

Date: 2026-07-16

## Scoped result

Implemented repository truth and setup reliability across the assigned documentation, database scripts, workspace commands, narrow port configuration, and architecture docs. Changes remain uncommitted.

## Changed files

- Truth/docs: `README.md`, `DEVELOPMENT.md`, `STATUS.md`, `CHANGELOG.md`, `architecture-plan.md`, `eushop-readiness-audit-and-plan.md`, `docs/architecture/runtime.md`
- Setup/config: `package.json`, `db/package.json`, `apps/web/next.config.js`, `services/core-service/src/main/resources/application.yml`
- Database: `db/migrations/manifest.json`, `db/scripts/migrate.js`, `db/scripts/seed.js`, `db/scripts/preflight.js`, `db/scripts/setup.test.js`, `db/seed/001_initial_data.sql`

## Behavior delivered

- Ports/defaults agree: web 3002, API 3001, PostgreSQL `eushop_db`/`eushop_dev` on 5432.
- Migrations are explicit, ordered, checksummed, advisory-locked, transaction-per-file, and bounded by a five-second connection timeout.
- A database with tables but no tracked migration history fails closed instead of replaying SQL destructively. Applied migration checksum drift also fails closed.
- Unsupported rating/chat drafts remain in the repository but are excluded from standard setup because they reference absent columns/tables. The legacy redundant PostgreSQL-invalid constraint line in migration 002 is narrowly omitted at execution without rewriting the historical file.
- Development fixtures require two explicit guards, use fixed fictional IDs, upsert deterministically, and leave the demo listing inactive.
- Preflight can validate tools and the migration plan before database dependencies are installed.

## Commands and exact results

- `node --test db/scripts/setup.test.js`: PASS, 5/5 tests.
- `node db/scripts/seed.js` without guards: expected FAIL (exit 1), message states development seed is disabled.
- `node db/scripts/preflight.js`: diagnostic completed; exit 1 because `pnpm` is missing. Node v22.11.0 and Java 21.0.4 found; Docker and Maven absent; migration manifest valid.
- `node --check db/scripts/migrate.js`, `seed.js`, `preflight.js`: PASS.
- `git diff --check`: PASS (only line-ending conversion warnings).

Not run: live PostgreSQL migration, web tests/build/type-check, backend Maven tests/build, and mobile checks. The environment lacks pnpm, Maven, Docker, installed `pg`, and a clearly local running PostgreSQL service. Static validation continued as required.

## Graceful degradation

Missing database packages no longer crash static preflight/tests. Optional Docker/Maven absence is reported distinctly. Database connection waits are bounded. Partial migration files roll back. Unknown existing schemas and checksum changes fail closed. Seed is disabled outside explicitly opted-in development. Documentation distinguishes static public browsing from backend/provider-dependent behavior.

## Unresolved risks

- A reviewed baseline procedure is still needed for databases created by the former untracked runner.
- `005_food_rating_materialized_view.sql`, both chat drafts, and `db/seed/002_extended_data.sql` need schema redesign; chat retention/erasure requires legal review (`COMPLIANCE-REVIEW`).
- No root pnpm lockfile exists. Web builds suppress lint/type errors. Provider-backed auth/payment and legal compliance are not proven.
- Likely merge conflicts: root truth docs, `package.json`, web API URL, Spring `application.yml`, and any concurrent database migration/setup work.
