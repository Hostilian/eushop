# EU Specialty Food Marketplace Platform

A full-featured marketplace connecting European users to discover and trade niche specialty foods (chocolates, liverwurst, regional candies, etc.). Modern 2026 tech stack with web + mobile apps, real-time messaging, payments, and location-based discovery.

## Project Structure

```
eushop/
├── apps/
│   ├── web/              # Next.js web application
│   └── mobile/           # React Native mobile app
├── services/
│   ├── api-gateway/      # Node.js/Express API Gateway (REST + GraphQL)
│   ├── core-service/     # Spring Boot core business logic
│   └── messaging-service/ # Spring WebFlux real-time messaging
├── db/
│   ├── migrations/       # Database migrations (Flyway)
│   └── seed/            # Seed data (countries, food categories)
├── infrastructure/
│   └── terraform/        # Infrastructure as Code
├── docs/                 # Documentation
└── docker-compose.yml    # Local development environment
```

## Tech Stack

### Frontend
- **Web**: Next.js 16 + React 19 + TypeScript + Tailwind CSS
- **Mobile**: React Native + Expo (iOS/Android)

### Backend (Microservices)
- **API Gateway**: Node.js + Express (REST + GraphQL Router)
- **Core Service**: Spring Boot/Java (listings, orders, transactions)
- **Messaging**: Spring WebFlux (WebSocket for real-time chat)

### Database & Cache
- **PostgreSQL 18+**: Primary data store (ACID for transactions)
- **Redis 8**: Session management, real-time feeds, caching
- **Elasticsearch 8+**: Full-text search with fuzzy matching

### Storage & Media
- **AWS S3 + Cloudflare CDN**: Image storage and delivery
- **Cloudinary**: Automatic image optimization and transformations

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 8+
- Docker & Docker Compose
- Java 17+ (for Spring Boot)

### Installation

1. **Clone and setup**
   ```bash
   git clone <repo>
   cd eushop
   pnpm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start infrastructure**
   ```bash
   docker-compose up -d
   # Verify all services are healthy
   docker-compose ps
   ```

4. **Start development servers**
   ```bash
   pnpm dev
   ```

   This starts:
   - Web app: http://localhost:3000
   - Mobile app: Expo dev server (instructions in terminal)
   - API Gateway: http://localhost:3000/api
   - Core Service: http://localhost:3001
   - Messaging: ws://localhost:3002

### Database Setup

Initialize database schema and seed data:
```bash
pnpm run db:migrate
pnpm run db:seed
```

## Development Workflow

### Running Individual Services

```bash
# Web app only
cd apps/web && pnpm dev

# Mobile app only
cd apps/mobile && pnpm start

# API Gateway
cd services/api-gateway && pnpm dev

# Core Service (requires Java)
cd services/core-service && ./gradlew bootRun
```

### Running Tests

```bash
pnpm test
```

### Linting & Formatting

```bash
pnpm lint
pnpm format
```

## Project Phases

### Phase 1: Discovery & Auth (Weeks 1-4)
- [ ] User registration/login (OAuth 2.0 + JWT)
- [ ] Food discovery by EU country
- [ ] Full-text search with fuzzy matching
- [ ] Filters (country, food type, price, ratings)
- [ ] Map view with seller locations

### Phase 2: Seller Listings (Weeks 5-8)
- [ ] Create/edit/delete listings
- [ ] Photo upload with Cloudinary optimization
- [ ] Set finder's fees
- [ ] Real-time notifications (WebSocket)

### Phase 3: Messaging & Requests (Weeks 9-12)
- [ ] Real-time buyer-seller chat
- [ ] Food request posting
- [ ] Request matching algorithm

### Phase 4: Payments & Orders (Weeks 13-16)
- [ ] Shopping cart
- [ ] Stripe checkout integration
- [ ] Order management workflow
- [ ] Seller payouts

### Phase 5: Reviews & Reputation (Weeks 17-20)
- [ ] Review/rating system
- [ ] Seller reputation scoring
- [ ] Verified purchase badges

### Phase 6: Polish & Launch (Weeks 21-24)
- [ ] Performance optimization
- [ ] UX/accessibility polish
- [ ] Comprehensive testing (unit, integration, E2E)
- [ ] Production deployment
- [ ] GDPR compliance

## API Overview

### REST Endpoints (API Gateway)

```
POST   /api/auth/signup         # Register new user
POST   /api/auth/login          # User login
GET    /api/foods               # List foods (with filters)
GET    /api/foods/:id           # Get food details
POST   /api/listings            # Create listing (seller)
PUT    /api/listings/:id        # Update listing
DELETE /api/listings/:id        # Delete listing
GET    /api/sellers/:id/reviews # Get seller reviews
POST   /api/orders              # Create order
GET    /api/orders/:id          # Get order details
POST   /api/reviews             # Submit review
```

### GraphQL Endpoints (API Gateway)

```
POST   /graphql                 # GraphQL queries
```

### WebSocket Endpoints (Messaging Service)

```
ws://localhost:3002/messages/:conversationId
```

## Monitoring & Logging

- **Logs**: Centralized via ELK Stack (Elasticsearch, Logstash, Kibana)
- **Monitoring**: Datadog (APM, infrastructure)
- **Error Tracking**: Sentry for real-time error alerts
- **Performance**: New Relic for application performance

## Deployment

### Local
```bash
docker-compose up -d
pnpm dev
```

### Staging
```bash
# Deployed to Vercel (web), EKS (backend)
git push origin staging
```

### Production
```bash
# Deployed to Vercel (web), EKS (backend)
git push origin main
```

## Documentation

See [docs/](docs/) directory for:
- [Architecture Overview](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [Database Schema](docs/DATABASE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT

## Contact

For questions or feedback, reach out to the team.
