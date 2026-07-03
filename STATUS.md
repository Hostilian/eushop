# EUshop — Project Status Report

**Last Updated:** July 2026

This is the canonical status tracking document for the `eushop` codebase. It outlines what features are implemented, in progress, or planned, with direct links to the code, tests, and configuration.

---

## 📊 Canonical Project Status Matrix

| Feature Area | Component / Sub-feature | Phase | Status | Notes / Description | Evidence Link |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Database** | Relational Schema & Tables | Phase 0 | **Implemented** | 8-table PostgreSQL schema for users, foods, orders, reviews, chat, notifications. | [001_initial_schema.sql](file:///d:/CODING/eushop/db/migrations/001_initial_schema.sql), [002_compliance_fields.sql](file:///d:/CODING/eushop/db/migrations/002_compliance_fields.sql) |
| **Backend** | Spring Boot Core Service | Phase 0 | **Implemented** | REST controllers, repositories, JPA entities, and basic services. | [core-service/src](file:///d:/CODING/eushop/services/core-service/src) |
| **CI/CD** | Automated Workflow | Phase 0 | **Implemented** | GitHub Actions running node linters and tests. | [ci-cd.yml](file:///d:/CODING/eushop/.github/workflows/ci-cd.yml) |
| **Testing** | Automated Test Footprint | Phase 0 | **In Progress** | Setup contains only single UserService unit test and Jest cart page test. | [UserServiceTest.java](file:///d:/CODING/eushop/services/core-service/src/test/java/com/eushop/core/service/UserServiceTest.java), [cart.test.tsx](file:///d:/CODING/eushop/apps/web/__tests__/cart.test.tsx) |
| **Auth** | User Authentication | Phase 1 | **In Progress** | Current flow uses mock base64 token and localStorage session; moving to Spring Boot for production-ready auth. | [services.ts (Web)](file:///d:/CODING/eushop/apps/web/lib/services.ts) |
| **Listings** | Food Listings CRUD | Phase 2 | **Implemented** | Create, edit, list, and delete food items. | [FoodController.java](file:///d:/CODING/eushop/services/core-service/src/main/java/com/eushop/core/controller/FoodController.java) |
| **Compliance** | Allergen Disclosure | Phase 2 | **Implemented** | Validation & storage of the 14 EU-regulated food allergens in DB. | [CreateFoodRequest.java](file:///d:/CODING/eushop/services/core-service/src/main/java/com/eushop/core/dto/CreateFoodRequest.java) |
| **Compliance** | KYBC & DAC7 Intake | Phase 2 | **In Progress** | Forms collect tax and business registration, backend saves them, frontend submit is pending integration. | [BecomeSellerRequest.java](file:///d:/CODING/eushop/apps/web/pages/become-seller.tsx) |
| **Messaging** | Buyer-Seller Chat | Phase 3 | **Implemented** | Relational DB storage and JPA models for messages and threads; client-side REST polling. | [ConversationController.java](file:///d:/CODING/eushop/services/core-service/src/main/java/com/eushop/core/controller/ConversationController.java) |
| **Payments** | Checkout & Payouts | Phase 4 | **Planned** | Checkout is currently represented as a mock frontend form; Stripe Connect integration planned. | [checkout.tsx](file:///d:/CODING/eushop/apps/web/pages/checkout.tsx) |
| **Reviews** | Reviews & Rating Aggregation | Phase 5 | **Implemented** | Rating submission and JPA-level recalculations. | [ReviewController.java](file:///d:/CODING/eushop/services/core-service/src/main/java/com/eushop/core/controller/ReviewController.java) |

---

## 🟢 Currently Implemented & Functional

### 1. Database Schema
- Relational schema implemented in PostgreSQL:
  - `users` (buyer/seller profiles, credential hashes, registration/tax numbers, address)
  - `foods` (seller listings, price, currency, category, allergens, dietary restriction JSONB)
  - `food_requests` (specialty food requests by buyers)
  - `orders` (transaction details, quantity, status)
  - `conversations` (buyer-seller chat threads)
  - `messages` (message contents, read status)
  - `reviews` (5-star ratings with comments)
  - `notifications` (system event notifications)

### 2. Core Service Business Logic
- Java Spring Boot application exposing REST endpoints for CRUD operations on all main resources:
  - Users (`UserController.java`)
  - Food Listings (`FoodController.java`)
  - Orders (`OrderController.java`)
  - Conversations & Messages (`ConversationController.java`)
  - Notifications (`NotificationController.java`)
  - Reviews (`ReviewController.java`)

### 3. Local Development Lifecycle
- `pnpm` workspaces routing the Next.js frontend (`apps/web`).
- Docker Compose setup running PostgreSQL and Redis containers locally.

---

## 🟡 Currently Mocked / Placeholder

### 1. User Authentication (Spring Boot Core Service / Frontend)
- Authentication currently uses a mock token (base64 payload mimicking JWTs) and persists user information in `localStorage` on the frontend.
- The Spring Boot Core Service will be updated to handle production-ready JWT validation and session management.

### 2. Payments (Stripe Checkout)
- Environment variable stubs exist in `.env.example`.
- No payment processing, webhook listeners, or payout split code is active in the Core Service or Next.js frontend.

---

## 🔴 Removed / Consolidated for MVP

### 1. Node.js Express API Gateway (`services/api-gateway`)
- Consolidated all API gateway responsibilities (routing, authentication, validation) into the core Spring Boot Service to simplify the architecture and reduce operational overhead.

### 2. Real-Time WebSocket Messaging Service (`services/messaging-service`)
- Consolidated all chat functionality into the core Spring Boot Service via REST polling to simplify infrastructure footprint.

### 3. Elasticsearch Full-Text Search
- Decommissioned Elasticsearch container. Search queries are resolved via direct PostgreSQL indexing and queries inside `FoodRepository` for the initial launch.

### 4. Mobile App (`apps/mobile`)
- The React Native mobile shell is frozen for the pre-seed fundraising MVP, prioritizing the Web application (`apps/web`).
