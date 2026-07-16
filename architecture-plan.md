# Architecture decision: Spring Boot modular monolith

Status: accepted direction; implementation remains partial. Last verified: 2026-07-16.

EUshop’s active backend is `services/core-service`. The Next.js web app and optional Expo prototype call it directly. PostgreSQL is the system of record. The archived Node gateway is not active; messaging microservices, Elasticsearch, GraphQL, and Terraform are not live runtime paths.

- `apps/web`: Pages Router UI/static export, local port 3002.
- `apps/mobile`: optional Expo prototype.
- `services/core-service`: REST/business logic, local port 3001.
- `db`: explicit PostgreSQL migrations and development-only fixtures.
- Redis: provisioned locally; active integration unconfirmed.
- Auth0/Stripe: optional integrations; missing configuration must not invent authentication or payment success.

PostgreSQL transactions provide local consistency. Stripe state is asynchronous, and only verified provider confirmation may establish payment success. The monolith reduces operational overhead and keeps transactions in one service/database boundary. Reconsider extraction only for measured scaling or ownership needs.

Entity/schema drift, incomplete provider flows, and regulatory interpretation remain gates. Architecture supplies structure, not legal certification; affected logic requires `// COMPLIANCE-REVIEW:`.
