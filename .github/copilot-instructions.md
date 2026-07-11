# EU Specialty Food Marketplace - Copilot Instructions

<!-- last verified: 2026-07-11 (against the actual tree, not older docs) -->

## Project Overview
This is a full-stack marketplace platform for discovering EU specialty foods. Monorepo built around a **Spring Boot modular monolith** (not microservices) with a Next.js web frontend and an Expo React Native mobile shell. There is no live API gateway, messaging service, Elasticsearch, GraphQL, or Terraform — those were consolidated out for the MVP (see `STATUS.md`, "Removed / Consolidated for MVP").

## Directory Structure
- `apps/web/` - Next.js web application (Pages Router, TypeScript, Tailwind; dev port 3002)
- `apps/mobile/` - React Native + Expo mobile app (**frozen for the pre-seed MVP**)
- `services/core-service/` - Spring Boot modular monolith (Java 17; port 3001). Owns users, foods, orders, reviews, conversations/chat, notifications, and payments.
- `db/` - Sequentially numbered SQL migrations and seed data (never edit a shipped migration; add the next number)
- `k8s/` - Kubernetes manifests (`core-service-deployment.yml`, `ingress.yml`)
- `docs/` - API and Auth0 setup docs

> Note: `services/api-gateway/` and `services/messaging-service/` no longer exist in the tree — their responsibilities were folded into `services/core-service`. `infrastructure/terraform/` exists but is an empty stub (no `.tf` files); there is no live Terraform/IaC.

## Tech Stack
- Frontend: Next.js 15, React 19 (web); React Native 0.76 + Expo 51 (mobile); TypeScript, Tailwind CSS
- Backend: Spring Boot (Java 17), PostgreSQL 16 (+ pg_trgm), Redis 7
- Auth: Auth0 (JWT / session verification) — note the web app still has a legacy mock-token path alongside the Auth0 wiring
- Payments: Stripe Connect (webhook-signature-verified)
- Deployment: Docker Compose (local), Kubernetes (`k8s/`)

## Key Development Rules
1. Use pnpm workspaces for monorepo management (workspace members: `apps/*` and `services/core-service` only — see `pnpm-workspace.yaml`)
2. TypeScript in strict mode for web/mobile
3. PostgreSQL for transactional data; Redis for sessions/caching; full-text search via PostgreSQL trigram indexing inside `FoodRepository` (no Elasticsearch)
4. RESTful API with cookie/session auth (no GraphQL)
5. Buyer-seller chat is REST-based (client-side polling), stored relationally in PostgreSQL (no WebSocket messaging service)
6. Always add a new sequential migration for database changes; keep it consistent with GDPR erasure/export and DSA/DAC7 compliance fields

## Setup Commands
```bash
cp .env.example .env.local
docker-compose up -d      # PostgreSQL + Redis
pnpm install
pnpm dev
```

## Testing Standards
- Unit tests for services and utilities; integration tests (MockMvc) for API endpoints; E2E for critical user flows
- Prioritize the highest-risk untested paths: Stripe webhook verification + order state transitions, KYBC/SELLER authorization gating, GDPR erasure/export, allergen data integrity
- Verify tests are actually wired into CI before relying on enforcement (current automated footprint is thin)

## Naming Conventions
- Files: kebab-case (e.g., user-service.ts)
- Classes: PascalCase (e.g., UserController)
- Constants: SCREAMING_SNAKE_CASE
- Variables/functions: camelCase
