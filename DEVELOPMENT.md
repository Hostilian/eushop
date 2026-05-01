# EUshop Development Guide

## Complete Setup & Running the Application

### Prerequisites
- Node.js 20+ installed
- Docker and Docker Compose installed
- pnpm installed globally (`npm install -g pnpm`)
- Git installed

### Step 1: Environment Setup

1. **Copy environment template:**
```bash
cp .env.example .env.local
```

2. **Edit `.env.local` with your settings:**
```bash
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=eushop
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# API Gateway
API_GATEWAY_PORT=3000
API_GATEWAY_URL=http://localhost:3000

# Optional: Auth0, Stripe, AWS, Cloudinary (for Phase 2+)
```

### Step 2: Install Dependencies

Dependencies are managed with pnpm workspaces. Install all packages:

```bash
pnpm install
```

This installs:
- `apps/web` - Next.js web application
- `apps/mobile` - React Native/Expo mobile app
- `services/api-gateway` - Node.js Express API Gateway
- `services/core-service` - Spring Boot microservice
- `services/messaging-service` - Spring WebFlux WebSocket service

### Step 3: Start Infrastructure

```bash
# Start Docker containers (PostgreSQL, Redis, Elasticsearch, pgAdmin)
docker-compose up -d

# Verify containers are running
docker-compose ps
```

Verify all containers are healthy:
- **postgres:5432** - Main database
- **redis:6379** - Caching and sessions
- **elasticsearch:9200** - Search engine
- **pgadmin:5050** - Database management UI (http://localhost:5050, admin@pgadmin.com)

### Step 4: Initialize Database

```bash
# Run migrations to create tables and schema
pnpm run db:migrate

# Seed test data (3 sellers, 3 foods)
pnpm run db:seed

# Verify data was inserted (using pgAdmin or psql)
# Connect to postgres://postgres:postgres@localhost:5432/eushop
```

### Step 5: Start Development Environment

**Option A: Start all services together (recommended)**
```bash
pnpm dev
```

This starts:
- Next.js web app on **http://localhost:3000**
- API Gateway on **http://localhost:3001** (via root dev script)
- React Native Expo dev server
- Spring Boot services (if configured)

**Option B: Start individual services**

```bash
# Terminal 1: Web app
cd apps/web
pnpm dev

# Terminal 2: API Gateway
cd services/api-gateway
pnpm dev

# Terminal 3: Mobile (Expo)
cd apps/mobile
pnpm start

# Terminal 4: Spring Boot services (requires Java/Maven)
cd services/core-service
mvn spring-boot:run
```

### Step 6: Access the Application

Once everything is running:

1. **Web App**: http://localhost:3000
   - Home page with login/signup buttons
   - Login with any test credentials
   - Browse specialty foods
   - View seller onboarding

2. **API Gateway**: http://localhost:3001/api
   - Health check: `http://localhost:3001/api/health`
   - Login: `POST http://localhost:3001/api/auth/login`
   - Signup: `POST http://localhost:3001/api/auth/signup`
   - Foods: `GET http://localhost:3001/api/foods`

3. **Database UI**: http://localhost:5050
   - Username: admin@pgadmin.com
   - Password: admin (default)
   - Add connection to postgres server

4. **Mobile**: Scan Expo QR code with Expo Go app (iOS/Android)

## Testing Authentication Flow

### 1. Signup
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "country": "Belgium"
  }'
```

Response includes `token` - save this for subsequent requests.

### 2. Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Use Token
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

## Common Commands

```bash
# Install new package across all workspaces
pnpm add package-name -w

# Install in specific workspace
pnpm add package-name --filter apps/web

# Run tests
pnpm test

# Build for production
pnpm build

# Stop Docker containers
docker-compose down

# View logs for specific container
docker-compose logs postgres
docker-compose logs -f redis

# Reset everything (careful!)
docker-compose down -v  # Removes volumes
pnpm clean              # Removes node_modules
pnpm install
```

## Project Structure

```
eushop/
├── apps/
│   ├── web/              # Next.js web application
│   │   ├── pages/        # Routes (login, signup, search, dashboard)
│   │   ├── lib/          # API client, services
│   │   └── public/       # Static assets
│   └── mobile/           # React Native/Expo app
├── services/
│   ├── api-gateway/      # Express.js REST/GraphQL API
│   ├── core-service/     # Spring Boot business logic
│   └── messaging-service/# Spring WebFlux WebSockets
├── db/
│   ├── migrations/       # SQL migration files
│   ├── seed/             # Test data
│   └── scripts/          # Migration/seed runners
├── infrastructure/       # Terraform IaC (future)
├── docs/                 # Documentation
└── docker-compose.yml    # Local infrastructure setup
```

## Authentication Architecture

### Current (Phase 1 - Mock)
- Mock JWT token (Base64 encoded JSON)
- Token stored in localStorage (web) / device storage (mobile)
- authMiddleware validates token by Base64 decoding

### Next Steps (Phase 2)
- Integrate Auth0 OAuth 2.0 with jose library
- Real JWT verification
- Refresh token rotation
- Session management with Redis

## Troubleshooting

### "Cannot find module" errors
```bash
# Clear and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install --no-frozen-lockfile
```

### Docker container won't start
```bash
# Check logs
docker-compose logs postgres

# Rebuild containers
docker-compose down -v
docker-compose up -d
```

### Port already in use
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### API Gateway connection refused
```bash
# Ensure API Gateway is running
cd services/api-gateway && pnpm dev

# Check logs for errors
# Default API Gateway port is 3001 or 3000 (check services/api-gateway/src/index.ts)
```

## Next Steps (Phase 2)

- [ ] Implement Spring Boot controllers for Core Service
- [ ] Add Auth0 integration with jose library
- [ ] Create WebSocket message handlers (Messaging Service)
- [ ] Add email verification system
- [ ] Implement Elasticsearch integration for advanced search
- [ ] Add payment processing (Stripe)
- [ ] Create real-time messaging UI
- [ ] Add seller listing management dashboard

## Support

For issues or questions:
1. Check the QUICKSTART.md for common problems
2. Review error logs in docker-compose output
3. Test endpoints directly with curl before debugging frontend
4. Check STATUS.md for current Phase progress

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Native / Expo](https://docs.expo.dev)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
