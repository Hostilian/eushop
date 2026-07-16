# EUshop development setup

Last verified: 2026-07-16.

## 1. Diagnose tools

Run `pnpm preflight`. Node, pnpm, and Java are required for the standard workspace; Docker and Maven are reported separately because Docker is only needed for repository-managed infrastructure and a Maven wrapper may substitute for system Maven. The command exits non-zero when a required tool or migration manifest entry is missing.

## 2. Install and configure

Run `pnpm install`. Copy `.env.example` to `.env.local` only when local overrides are needed. Never commit or print `.env.local`.

Local defaults are consistent across Compose, the migration runner, and Spring:

- PostgreSQL: `localhost:5432`, database `eushop_db`, user `eushop_dev`
- Spring API: `http://localhost:3001`
- Next.js web: `http://localhost:3002`
- Redis: `localhost:6379` (provisioned, integration not confirmed)

## 3. Start infrastructure and migrate

```sh
docker compose up -d postgres redis
docker compose ps
pnpm db:migrate
```

The migration runner uses a PostgreSQL advisory lock, a checksummed `schema_migrations` table, one transaction per file, and a five-second connection timeout. It executes only `db/migrations/manifest.json`. It never drops a database or volume.

Do not use `docker compose down -v` as a troubleshooting step: it destroys local data. Existing databases created before checksummed tracking may need a reviewed baseline procedure; do not guess or mark migrations as applied without comparing the schema.

## 4. Optional development fixtures

The seed contains fictional demo data, uses fixed IDs, is safe to repeat, and leaves its listing inactive. It fails closed unless both guards are set:

```sh
NODE_ENV=development EUSHOP_ALLOW_DEV_SEED=1 pnpm db:seed
```

`db/seed/002_extended_data.sql` is retained as an unsupported historical fixture because its columns do not match the canonical migration schema. The standard seed command does not execute it.

## 5. Run services

Use separate terminals:

```sh
cd services/core-service
mvn spring-boot:run
```

```sh
pnpm --filter @eushop/web dev
```

Verify API health with `curl http://localhost:3001/actuator/health` and open `http://localhost:3002`. `pnpm dev` intentionally starts only the web app; mobile and backend startup are explicit so an optional component failure does not hide the usable web process.

For mobile, run `pnpm --filter @eushop/mobile start`. This is a prototype path and may require Expo-compatible dependency alignment before a native build.

## 6. Checks

```sh
pnpm test:setup
pnpm --filter @eushop/web type-check
pnpm --filter @eushop/web test
pnpm --filter @eushop/core-service test
pnpm --filter @eushop/web build
```

The web build is a static export. GitHub Pages serves only those static files; API-backed features must show their unavailable or demo state when no separately hosted backend exists.

## Known setup limitations

- `005_food_rating_materialized_view.sql` expects `reviews.food_id`, which the canonical schema does not create. `009_chat_enhancements.sql` and `010_group_chat_enhancements.sql` reference non-existent chat columns/tables and mismatched ID types. They are not in the migration manifest and require redesign, including legal review of retention/erasure behavior.
- The workspace has no checked-in `pnpm-lock.yaml`, reducing install reproducibility.
- Authentication, payment, and compliance behavior is partial; successful production behavior must not be inferred from controllers or UI alone.
