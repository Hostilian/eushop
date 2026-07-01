# EU Specialty Food Marketplace Platform

A marketplace platform connecting European users to discover and trade niche specialty foods (chocolates, regional candies, pantry staples, etc.) within the EU Single Market.

> [!NOTE]
> This project is currently in the **MVP development phase**. The core relational schema and Spring Boot API endpoints are implemented. Several other features (such as Stripe payments and Auth0 integration) are currently represented by development mocks or placeholders.

## Project Structure

```
eushop/
├── apps/
│   └── web/              # Next.js web application
├── services/
│   └── core-service/     # Spring Boot core business logic monolith
├── db/
│   ├── migrations/       # Database migrations (PostgreSQL)
│   └── seed/            # Seed data (countries, food categories)
├── docs/                 # Project documentation
└── docker-compose.yml    # Local development environment (Postgres + Redis)
```

## Tech Stack (MVP Status)

### Frontend
- **Web**: Next.js 16 + React 19 + TypeScript + Tailwind CSS

### Backend
- **Core Service**: Spring Boot / Java 17 + JPA + Hibernate + REST endpoints (running on port `3001` or routed via gateway)
- **API Gateway**: Node.js + Express (JWT token validation skeleton, running on port `3000`)

### Database & Cache
- **PostgreSQL 18+**: Primary data store with 8-table relational schema
- **Redis 8**: Cache and session storage

---

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 8+
- Docker & Docker Compose
- Java 17+

### Installation & Local Setup

1. **Clone and setup**
   ```bash
   git clone <repo>
   cd eushop
   pnpm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration (such as local DB/Redis settings)
   ```

3. **Start local database & cache**
   ```bash
   docker-compose up -d
   # Verify containers (postgres and redis) are healthy
   docker-compose ps
   ```

4. **Initialize database schema and seed data**
   ```bash
   pnpm run db:migrate
   pnpm run db:seed
   ```

5. **Start development servers**
   ```bash
   pnpm dev
   ```

   This starts:
   - Web application: http://localhost:3000
   - API Gateway: http://localhost:3000/api
   - Core Service: http://localhost:3001

---

## Project Status & Roadmap

### Phase 1: Discovery & Auth (Current Focus)
- [x] Solid relational database schema setup (Users, Foods, Food Requests, Orders, Reviews, Notifications)
- [x] Basic Spring Boot Core API REST endpoints (CRUD for foods, users, orders)
- [/] User login/signup (using Next.js frontend, currently wired to mock token gateway)
- [ ] Map view with seller locations (Future)

### Phase 2: Seller Listings & Compliance (In Progress)
- [x] Create/edit/delete listings in core database
- [x] Allergen disclosure fields (14 EU allergens)
- [ ] KYBC (Know-Your-Business-Customer) & DAC7 tax registration forms (In progress)
- [ ] Photo upload with Cloudinary or S3 integration (Planned)

### Phase 3: Messaging & Requests (Planned)
- [ ] Messaging/Conversation schema defined in database
- [ ] REST API message retrieval and polling (Consolidated into Core Service)
- [ ] Direct buyer-seller chat interface

### Phase 4: Payments & Orders (Planned)
- [x] Database model for order processing
- [ ] Shopping cart & Checkout flow UI (In progress)
- [ ] Stripe Connect B2C split-payment integration

### Phase 5: Reviews & Reputation (Planned)
- [x] Review/rating schema and average-rating calculation in core services
- [ ] Verified purchase badge checks

---

## License

Proprietary — All Rights Reserved.
