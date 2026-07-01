# EUshop — Project Status Report

**Last Updated:** July 2026

This document tracks the verified status of the `eushop` codebase, highlighting what is currently functional, what is mocked/placeholder, and what is currently in development.

---

## 🟢 Currently Implemented & Functional

### 1. Database Schema (`db/migrations/001_initial_schema.sql`)
- Verified 8-table relational PostgreSQL schema implemented in a single migration script (divided into 7 distinct logical migration segments):
  - `users` (buyer/seller profiles, credential hashes)
  - `foods` (seller listings, price, currency, category, allergens, dietary restriction JSONB)
  - `food_requests` (buyer posting for specialty foods)
  - `orders` (transactions, quantity, tracking numbers, status flow)
  - `conversations` (chat threads between buyers and sellers)
  - `messages` (chat message contents, read status)
  - `reviews` (5-star rating system with verified purchase flags)
  - `notifications` (system event records)

### 2. Core Service Business Logic (`services/core-service/`)
- Functional Java Spring Boot application structured with controllers, services, repositories, and JPA entities matching the relational database schema.
- Exposes REST endpoints for:
  - Users (`UserController`)
  - Food listings (`FoodController`)
  - Order management (`OrderController`)
  - Conversations & Messages (`ConversationController` / REST-based chat)
  - Notifications (`NotificationController`)
  - Reviews (`ReviewController`)

### 3. API Gateway Routing (`services/api-gateway/`)
- Node.js/Express server configured with Express HTTP routing, request loggers, and Zod validator middleware schemas.
- Interfaces with the frontend on port `3000`.

### 4. Monorepo Setup & Local Dev Lifecycle
- `pnpm` workspaces routing the Next.js frontend (`apps/web`) and Express backend API Gateway (`services/api-gateway`).
- Docker Compose setup running PostgreSQL (`port 5432`) and Redis (`port 6379`) containers locally.

---

## 🟡 Currently Mocked / Placeholder

### 1. User Authentication (API Gateway / Frontend)
- Authentication uses a mock token exchange gateway (base64 payload mimicking JWTs) and persists user information in `localStorage`.
- Gated integration code exists for checking Auth0 JWKS signatures, but requires connection to a live Auth0 tenant client.

### 2. Payments (Stripe Checkout)
- Environment variable stubs exist in `.env.example`.
- No payment processing, webhook listener, or payout split code has been integrated into the Spring Boot Core Service or Next.js frontend yet.

---

## 🔴 Removed / Consolidated for MVP

### 1. Real-Time WebSocket Messaging Service (`services/messaging-service/`)
- Deprecated the separate Java WebFlux messaging service to simplify infrastructure.
- Messaging and chat threads are handled via the Spring Boot Core Service (`ConversationController` & `Message` JPA entities) using client-side REST polling.

### 2. Elasticsearch Full-Text Search
- Decommissioned Elasticsearch container to reduce local system resource footprint.
- Search queries are resolved via direct PostgreSQL indexing and query logic inside `FoodRepository` for the initial launch.

### 3. Mobile App (`apps/mobile`)
- Mobile application remains a static 4-screen layout shell (Expo/React Native) and is frozen for the pre-seed fundraising MVP, prioritizing the Web application (`apps/web`).

---

## 🛠️ How to Run the Local Stack

1. **Configure Environment:**
   ```bash
   cp .env.example .env.local
   # Edit values as necessary
   ```

2. **Launch Postgres & Redis Infrastructure:**
   ```bash
   docker-compose up -d
   ```

3. **Install Dependencies & Seed Database:**
   ```bash
   pnpm install
   pnpm run db:migrate
   pnpm run db:seed
   ```

4. **Start Web & Gateway Servers:**
   ```bash
   pnpm dev
   ```
