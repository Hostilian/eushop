# EUshop

EUshop is a work-in-progress Pan-European specialty-food marketplace. This repository contains a static-exportable Next.js web app, an Expo mobile prototype, a Spring Boot API, and PostgreSQL migrations. It is not evidence of production readiness or legal compliance.

Last verified against the repository: 2026-07-16.

## Runtime paths

| Component | Path | Local address | Verified state |
| --- | --- | --- | --- |
| Web | `apps/web` | `http://localhost:3002` | Active Pages Router app; static export is deployed by `.github/workflows/nextjs.yml`. Some screens use demo/fallback data. |
| API | `services/core-service` | `http://localhost:3001` | Active Spring Boot modular monolith. External Auth0 and Stripe paths require configuration and are incomplete without it. |
| Mobile | `apps/mobile` | Expo development server | Prototype with EAS configuration; not a verified store release. |
| Database | `db` | PostgreSQL on `localhost:5432` | Eight migrations through `009_android_device_tokens` are supported by the manifest. The rating view and two chat drafts are excluded because they target columns absent from the canonical schema. |
| Public deployment | GitHub Pages | `https://hostilian.github.io/eushop/` | Web static export only; no backend is deployed by the Pages workflow. |

Redis is present in local Compose, but current source does not prove it is wired for sessions or caching. Archived services are not active runtime components.

## Quick start

Prerequisites: Node 20+, pnpm 9, Java 17, Maven 3.8+, and optionally Docker Compose for local infrastructure.

```sh
pnpm preflight
pnpm install
docker compose up -d postgres redis
pnpm db:migrate
pnpm --filter @eushop/core-service build
pnpm --filter @eushop/web dev
```

Start the API separately with `mvn spring-boot:run` from `services/core-service`. Verify it at `http://localhost:3001/actuator/health`; verify the web app at `http://localhost:3002`.

Development demo fixtures are fictional and opt-in:

```sh
NODE_ENV=development EUSHOP_ALLOW_DEV_SEED=1 pnpm db:seed
```

On PowerShell, set those environment variables with `$env:NODE_ENV='development'` and `$env:EUSHOP_ALLOW_DEV_SEED='1'` before running the command.

See [DEVELOPMENT.md](DEVELOPMENT.md) for setup diagnostics and [STATUS.md](STATUS.md) for confirmed, partial, and planned behavior.

## Compliance and license

Regulatory code and documentation provide implementation structure only. Qualified legal and tax professionals must review it before any compliance claim or launch. Regulatory constants belong only in `packages/compliance` and unresolved interpretations are marked `COMPLIANCE-REVIEW`.

The repository license is proprietary; see [LICENSE](LICENSE).
