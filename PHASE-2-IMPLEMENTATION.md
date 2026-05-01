# Phase 2 Implementation Guide

**Status**: ✅ Infrastructure Complete | 🟡 Integration In Progress  
**Date**: 2024  
**Focus**: Real Auth0 OAuth 2.0 Integration, Enhanced API Client, Marketplace Features

## Overview

Phase 2 transitions the EU Specialty Food Marketplace from mock authentication to real Auth0 OAuth 2.0 integration while expanding marketplace functionality. This guide documents the complete infrastructure setup and implementation path.

## Completed: Authentication Infrastructure

### 1. Auth0 JWT Verification Library
**File**: `services/api-gateway/src/lib/auth0.ts`

Implements dual-mode authentication supporting both mock (Phase 1) and real Auth0 (Phase 2) verification:

```typescript
// Real Auth0 verification with JWKS caching
async verifyAuth0Token(token: string): Promise<JwtPayload>
  - Validates RS256 JWT signature
  - Caches JWKS from Auth0 endpoint (1 hour TTL)
  - Extracts signing key by kid from header
  - Returns decoded payload with sub, email, aud, iss

// Development support: Generate mock tokens
generateMockAuth0Token(userId: string, email: string): string
  - Creates Base64 encoded mock JWT
  - 24-hour expiration
  - Compatible with Phase 1 mock auth

// Helper: Detect Auth0 token format
isAuth0Token(token: string): boolean
  - Checks for 3-part JWT format
  - Differentiates from mock tokens
```

**Setup Required**:
1. Set environment variables:
   ```bash
   AUTH0_DOMAIN=your-domain.auth0.com
   AUTH0_CLIENT_ID=your_client_id
   AUTH0_CLIENT_SECRET=your_client_secret
   ```
2. Configure Auth0 API Identifiers (audience) to match API_GATEWAY_AUDIENCE
3. See [AUTH0_SETUP.md](AUTH0_SETUP.md) for complete instructions

### 2. API Configuration Module
**File**: `apps/web/lib/config.ts`

Centralized environment configuration with sensible defaults:

```typescript
const API_CONFIG = {
  // API Connection
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 10000, // 10 second request timeout

  // Auth0 Configuration
  AUTH0_DOMAIN: process.env.NEXT_PUBLIC_AUTH0_DOMAIN || '',
  AUTH0_CLIENT_ID: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || '',
  AUTH0_REDIRECT_URI: typeof window !== 'undefined' 
    ? `${window.location.origin}/api/auth/callback`
    : '',
  USE_MOCK_AUTH: process.env.NEXT_PUBLIC_USE_MOCK_AUTH !== 'false', // Default: true (Phase 1)

  // Performance
  CACHE_TTL: 5 * 60 * 1000, // 5 minute cache for API responses
  
  // Retry Configuration
  RETRY_MAX_ATTEMPTS: 3,
  RETRY_BACKOFF_MULTIPLIER: 2,

  // Feature Flags
  DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
}
```

**Usage**:
```typescript
import API_CONFIG from './config';

// Use centralized settings throughout app
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});
```

### 3. Enhanced API Client
**File**: `apps/web/lib/api-client.ts`

Updated with error handling and configuration management:

```typescript
// Request interceptor: Auto-inject Bearer token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Features**:
- Uses `API_CONFIG.BASE_URL` for environment-specific API endpoint
- Uses `API_CONFIG.TIMEOUT` for request timeout
- Auto-injects Bearer token from localStorage in request headers
- Automatically redirects to login on 401 Unauthorized (token expired or invalid)
- Clears localStorage before redirect to ensure clean login flow
- Prevents redirect loop on login page

## Completed: Frontend Enhancements

### 4. Food Detail Page
**File**: `apps/web/pages/food/[id].tsx`

Dynamic product detail page with complete marketplace functionality:

**Features**:
- ✅ Dynamic URL routing via `[id]` parameter
- ✅ Load food details via `foodAPI.getById(id)`
- ✅ Display: name, price, location, category, description, seller info
- ✅ Quantity selector with +/- buttons
- ✅ Add to cart functionality (mock, ready for backend integration)
- ✅ Message seller button (navigates to messages with seller param)
- ✅ Dietary restrictions display with badges
- ✅ Seller rating and verification status
- ✅ Error handling with fallback to search page
- ✅ Loading state with spinner
- ✅ Responsive grid layout (1 col mobile, 2 col desktop)

**Data Flow**:
```
Search Results Page → Click food item → Navigate to /food/[id]
→ useEffect: Fetch foodAPI.getById(id)
→ Display details in layout
→ User can add to cart or contact seller
```

### 5. Error Handling Utilities
**File**: `apps/web/lib/errors.ts`

Typed error handling for consistent API error management:

```typescript
class APIError extends Error {
  constructor(statusCode: number, message: string, details?: string)
  toJSON() // Returns {error, statusCode, details}
}

// Format API errors from axios
formatErrorResponse(error: any)

// Retry with exponential backoff
retryWithBackoff<T>(fn, maxRetries, initialDelay)

// Check if error is retryable
isRetryableError(error: any): boolean
```

### 6. Utility Functions
**File**: `apps/web/lib/utils.ts`

General purpose utilities for common tasks:

```typescript
// Async data fetching with retry logic
useAsyncData<T>(asyncFn, retryOptions)

// File size formatting
formatFileSize(bytes: number): string

// Debounce function for search inputs
debounce<T>(func, wait)

// Currency and date formatting
formatCurrency(amount, currency)
formatDate(date)
```

## Completed: Backend Infrastructure

### 7. Spring Boot Entity Models
**Location**: `services/core-service/src/main/java/com/eushop/core/entity/`

Complete JPA entity classes with validation and relationships:

#### User.java
```java
@Entity @Table(name = "users")
- id: UUID
- email: Unique, Email validated
- name: NotBlank
- auth0Sub: From Auth0 JWT (sub claim)
- role: BUYER | SELLER | ADMIN
- country: 2-letter ISO code
- emailVerified, kycVerified: Boolean flags
- averageRating, reviewCount, completedOrders: Stats
- Timestamps: createdAt, updatedAt, lastLoginAt
```

#### Food.java
```java
@Entity @Table(name = "foods")
- id: UUID
- name, description: Product info
- sellerId: Foreign key to User
- category: String (Chocolate, Cheese, etc.)
- price, finderFee: Double with @Min validation
- country: Location
- quantity: Stock count
- dietaryRestrictions: JSON array
- images: JSON array of URLs
- available: Boolean flag
- Ratings: averageRating, reviewCount
- Analytics: viewCount, salesCount
- Timestamps: createdAt, updatedAt
```

#### Order.java
```java
@Entity @Table(name = "orders")
- id: UUID
- buyerId, sellerId: Foreign keys
- foodId: Product reference
- quantity: Min 1
- totalPrice, finderFee: Monetary values
- status: PENDING | CONFIRMED | SHIPPED | DELIVERED | CANCELLED
- message: Buyer's special instructions
- shippingAddress, trackingNumber: Logistics
- metadata: JSON for extensibility
- Timestamps: createdAt, updatedAt, completedAt
```

#### Review.java
```java
@Entity @Table(name = "reviews")
- id: UUID
- foodId, reviewerId, sellerId: References
- rating: 1-5 validated
- comment: Required text
- highlights, improvements: JSON arrays
- verified: Boolean (only if purchased)
- Timestamps: createdAt, updatedAt
```

### 8. Spring Data JPA Repositories
**Location**: `services/core-service/src/main/java/com/eushop/core/repository/`

#### UserRepository
```java
- findByEmail(String): For login
- findByAuth0Sub(String): JWT verification
- findTopSellers(): Trending sellers
- findSellersByCountry(String): Location-based search
- countSellers(), countBuyers(): Metrics
- findByRole(...): Role-based queries
```

#### FoodRepository
```java
- findByAvailableTrue(Pageable): Available items
- findByCategory(String, Pageable): Category search
- findByCountry(String, Pageable): Location search
- searchByNameOrDescription(query, Pageable): Full-text search
- findTrendingByCountry(...): Trending products
- findMostViewed(), findTopRated(), findNewest(): Discovery
- countBySellerId(String): Seller's inventory
```

#### OrderRepository
```java
- findByBuyerId(String, Pageable): Purchase history
- findBySellerId(String, Pageable): Order management
- findByStatus(...): Order tracking
- calculateSellerRevenue(String): Financial metrics
- countCompletedOrdersSince(...): Analytics
```

#### ReviewRepository
```java
- findByFoodId(...), findBySellerId(...): Review lists
- getAverageRatingByFood/Seller(...): Rating calculations
- countVerifiedReviewsBySeller(...): Trust metrics
- existsByFoodIdAndReviewerId(...): Prevents duplicates
```

### 9. Updated API Gateway Error Handler
**File**: `services/api-gateway/src/middleware/error-handler.ts`

Enhanced error handler with Auth0 support:

```typescript
// Auth middleware: Async with Auth0 verification
export const authMiddleware = async (req, res, next) => {
  // 1. Check for Authorization header
  // 2. Try Auth0 verification if configured
  // 3. Fall back to mock token verification
  // 4. Attach userId and user to request
  // 5. Handle verification errors with 401
}
```

**Flow**:
1. Extract Bearer token from Authorization header
2. If `AUTH0_DOMAIN` configured: Try `verifyAuth0Token()` from auth0.ts
3. If Auth0 verification fails: Fall back to Base64 mock token parsing
4. If all fail: Return 401 Unauthorized with error details
5. Attach decoded user data to `req.userId` and `req.user`

## Pending: Next Phase 2 Tasks

### Priority 1: Spring Boot Controllers (Backend)
**Location**: `services/core-service/src/main/java/com/eushop/core/controller/`

Need to implement:
1. **UserController** - User profile management
   - GET /users/:id - Profile fetch
   - PUT /users/:id - Profile update
   - GET /users/:id/foods - Seller's listings
   - GET /sellers/top - Trending sellers

2. **FoodController** - Food CRUD & search
   - GET /foods - List all (with pagination)
   - GET /foods/:id - Detail view
   - POST /foods - Create listing (seller)
   - PUT /foods/:id - Edit listing (seller)
   - DELETE /foods/:id - Remove listing (seller)
   - GET /foods/search - Full-text search
   - GET /foods/trending - Trending foods

3. **OrderController** - Purchase flow
   - POST /orders - Create order
   - GET /orders/:id - Order details
   - GET /orders - User's orders
   - PUT /orders/:id/status - Update status
   - POST /orders/:id/cancel - Cancel order

4. **ReviewController** - Ratings & reviews
   - POST /foods/:id/reviews - Create review
   - GET /foods/:id/reviews - Food reviews
   - GET /sellers/:id/reviews - Seller reviews
   - PUT /reviews/:id - Edit review

### Priority 2: Real Auth0 Integration Testing
**Steps**:
1. Configure Auth0 application (see AUTH0_SETUP.md)
2. Test login flow with real Auth0 JWT
3. Verify token verification in API Gateway
4. Test 401 redirect on token expiration
5. Implement token refresh mechanism

### Priority 3: Seller Dashboard
**File**: `apps/web/pages/seller/dashboard.tsx`
- List seller's foods
- Edit/delete listings
- Create new listing form
- Order management
- Revenue display

### Priority 4: WebSocket Real-Time Features
**Location**: `services/messaging-service/src/main/java/com/eushop/messaging/`
- Message handlers
- Redis pub/sub integration
- WebSocket connection management

## Environment Configuration

### Frontend (.env.local)
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Auth0 (for Phase 2)
NEXT_PUBLIC_AUTH0_DOMAIN=your-domain.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your_client_id

# Feature Flags
NEXT_PUBLIC_USE_MOCK_AUTH=false  # Set to 'false' to use real Auth0
NEXT_PUBLIC_DEBUG_MODE=true       # Enable debug logging
```

### Backend (.env)
```bash
# Auth0 Configuration
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
API_GATEWAY_AUDIENCE=https://api.eushop.local

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/eushop

# Redis
REDIS_URL=redis://localhost:6379

# Node Environment
NODE_ENV=development
```

## Docker Compose Services

All services already configured:
```bash
# Start all services
docker-compose up -d

# Services:
- PostgreSQL 16: localhost:5432
- Redis 7: localhost:6379
- Elasticsearch 8: localhost:9200
- API Gateway: localhost:3000
- Spring Boot Core: localhost:8080
```

## Testing Checklist

### Authentication Flow
- [ ] Signup with email/password → Token created
- [ ] Login with credentials → Token retrieved
- [ ] Token stored in localStorage
- [ ] API calls include Bearer token
- [ ] 401 response → Redirect to login
- [ ] Token refresh on expiration

### Marketplace Features
- [ ] Search foods by query/country
- [ ] View food details page
- [ ] Add to cart (mock)
- [ ] Contact seller via messages
- [ ] View seller profile & ratings
- [ ] Browse trending foods

### Backend Integration
- [ ] foodAPI.getById() calls Spring endpoint
- [ ] userAPI calls return real data
- [ ] Database queries persist data
- [ ] Error responses properly formatted

## Related Documentation

- [DEVELOPMENT.md](DEVELOPMENT.md) - Full setup and development guide
- [API.md](API.md) - Complete API endpoint reference
- [AUTH0_SETUP.md](AUTH0_SETUP.md) - Step-by-step Auth0 configuration
- [POST-PHASE-1.md](POST-PHASE-1.md) - Phase 1 completion report

## Quick Start (Phase 2)

```bash
# 1. Install dependencies
pnpm install

# 2. Configure Auth0 (or use mock mode)
cp .env.example .env.local
# Edit .env.local with your Auth0 credentials

# 3. Start services
docker-compose up -d
pnpm db:migrate
pnpm db:seed

# 4. Start development
pnpm dev
# Web: http://localhost:3000
# API: http://localhost:3001 (or 3000)

# 5. Test food detail page
# Navigate to search page → Click a food → See /food/[id] page
```

## Summary

Phase 2 establishes the complete infrastructure for real OAuth 2.0 authentication while maintaining backward compatibility with mock auth. The Spring Boot entities and repositories provide a solid foundation for implementing business logic controllers. The enhanced frontend with error handling, retry logic, and the food detail page showcase marketplace functionality ready for backend integration.

**Next milestone**: Implement Spring Boot controllers to complete the CRUD operations for foods, orders, and sellers.
