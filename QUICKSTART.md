# Quick Start Guide for EUshop Development

## Prerequisites
- **Node.js** 20+ (https://nodejs.org/)
- **pnpm** 8+ (npm install -g pnpm)
- **Docker** & **Docker Compose** (https://www.docker.com/products/docker-desktop)
- **Git** (https://git-scm.com/)

## Quick Start (3 steps)

### Step 1: Setup Environment
```bash
# Clone repository
git clone <your-repo>
cd eushop

# Copy environment file
cp .env.example .env.local

# Install dependencies
pnpm install
```

### Step 2: Start Infrastructure
```bash
# Start PostgreSQL, Redis, Elasticsearch (+ pgAdmin)
docker-compose up -d

# Verify services are healthy
docker-compose ps

# Access pgAdmin at http://localhost:5050 (admin/admin)
```

### Step 3: Initialize Database & Run Services
```bash
# Migrate database schema
pnpm run db:migrate

# Seed initial data
pnpm run db:seed

# Start all development servers
pnpm dev
```

## Access Points

| Service | URL | Notes |
|---------|-----|-------|
| Web App | http://localhost:3000 | Next.js frontend |
| API Gateway | http://localhost:3000/api | REST API |
| Mobile (Expo) | Terminal output | React Native dev server |
| pgAdmin | http://localhost:5050 | DB management (admin/admin) |

## Development Commands

```bash
# Run all services in parallel
pnpm dev

# Run individual services
cd apps/web && pnpm dev          # Web app only
cd apps/mobile && pnpm start     # Mobile app only
cd services/api-gateway && pnpm dev  # API Gateway only

# Run tests
pnpm test

# Lint & format
pnpm lint
pnpm format

# Stop infrastructure
docker-compose down

# View service logs
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f elasticsearch
```

## Project Structure

```
eushop/
├── apps/web/              # Next.js web app
├── apps/mobile/           # React Native app
├── services/
│   ├── api-gateway/      # Node.js API Gateway
│   ├── core-service/     # Spring Boot service
│   └── messaging-service/# Spring WebFlux WebSocket
├── db/                    # Database migrations & seed
├── docker-compose.yml     # Local infra
└── README.md
```

## Phase 1 Checklist

- [x] Monorepo setup (pnpm workspaces)
- [x] Web app scaffolded (Next.js)
- [x] Mobile app scaffolded (React Native)
- [x] API Gateway structure (Node.js/Express)
- [x] Database migrations ready
- [ ] **TODO: Install dependencies**
- [ ] **TODO: Start Docker Compose**
- [ ] **TODO: Run migrations**
- [ ] **TODO: Verify services running**

## Troubleshooting

**Port already in use?**
```bash
# Find process on port 3000
lsof -i :3000
# Or on Windows
netstat -ano | findstr :3000
```

**Docker containers won't start?**
```bash
# Check Docker logs
docker-compose logs postgres

# Rebuild containers
docker-compose down && docker-compose up -d
```

**Database connection error?**
```bash
# Verify .env.local has correct credentials
cat .env.local | grep POSTGRES

# Test connection
psql -h localhost -U eushop_dev -d eushop_db
```

## Next: Auth0 Setup
See [docs/AUTH0_SETUP.md](../docs/AUTH0_SETUP.md) for OAuth 2.0 integration.

## Questions?
Check [docs/](../docs/) folder or raise an issue.
