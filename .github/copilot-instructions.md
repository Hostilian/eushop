# EU Specialty Food Marketplace - Copilot Instructions

## Project Overview
This is a full-stack microservices marketplace platform for discovering EU specialty foods. Monorepo with Next.js (web), React Native (mobile), Node.js/Express (API Gateway), and Spring Boot (core services).

## Directory Structure
- `apps/web/` - Next.js web application
- `apps/mobile/` - React Native + Expo mobile app
- `services/api-gateway/` - Node.js Express API Gateway (REST + GraphQL)
- `services/core-service/` - Spring Boot microservice
- `services/messaging-service/` - Spring WebFlux for WebSocket
- `db/` - Database migrations and seed data
- `infrastructure/` - Terraform IaC

## Tech Stack
- Frontend: Next.js 16, React 19, React Native, TypeScript, Tailwind CSS
- Backend: Node.js/Express, Spring Boot, PostgreSQL, Redis, Elasticsearch
- Deployment: Docker, Kubernetes, Terraform

## Key Development Rules
1. Use pnpm workspaces for monorepo management
2. All TypeScript code - strict mode enabled
3. PostgreSQL for transactional data, Redis for caching, Elasticsearch for search
4. RESTful + GraphQL hybrid API approach
5. WebSocket for real-time messaging via Spring WebFlux
6. Always add migrations for database changes

## Setup Commands
```bash
cp .env.example .env.local
docker-compose up -d
pnpm install
pnpm dev
```

## Testing Standards
- Unit tests for utilities and services
- Integration tests for API endpoints
- E2E tests for critical user flows
- Minimum 80% code coverage

## Naming Conventions
- Files: kebab-case (e.g., user-service.ts)
- Classes: PascalCase (e.g., UserController)
- Constants: SCREAMING_SNAKE_CASE
- Variables/functions: camelCase
