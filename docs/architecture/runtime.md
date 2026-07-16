# Runtime and deployment truth

Last verified: 2026-07-16.

```text
Browser (Next.js static export; local :3002)
       | REST when configured
       v
Spring Boot core (:3001) ---> Auth0 / Stripe (optional external providers)
       |
       v
PostgreSQL (:5432)

Expo prototype -----------^  optional
Redis (:6379)                provisioned; active use unconfirmed
```

GitHub Pages deploys only `apps/web/out`. Public navigation must remain useful without an API; authentication must fail closed; checkout must never show success without confirmed provider/backend success. The canonical database path is `db/migrations/manifest.json`; unlisted SQL is not standard setup.
