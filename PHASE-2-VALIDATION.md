# Phase 2 Validation Checklist

## Status: Infrastructure Complete ✅

Use this checklist to validate Phase 2 implementation and identify remaining work.

## Authentication Infrastructure

### Auth0 Library (services/api-gateway/src/lib/auth0.ts)
- [ ] File exists and contains verifyAuth0Token() function
- [ ] verifyAuth0Token() validates RS256 JWT signatures
- [ ] JWKS caching implemented with 1-hour TTL
- [ ] generateMockAuth0Token() creates valid mock tokens
- [ ] isAuth0Token() correctly identifies 3-part JWTs
- [ ] Error handling for missing/invalid keys
- [ ] Logging for debug mode

**Test Command**:
```bash
# Test mock token generation
cd services/api-gateway
npm test -- auth0.spec.ts
```

### API Configuration (apps/web/lib/config.ts)
- [ ] File exports API_CONFIG object
- [ ] BASE_URL from environment or defaults to localhost
- [ ] TIMEOUT set to 10000ms
- [ ] AUTH0_* settings from environment variables
- [ ] USE_MOCK_AUTH controlled by NEXT_PUBLIC_USE_MOCK_AUTH
- [ ] CACHE_TTL and RETRY settings configured
- [ ] DEBUG_MODE can be enabled via env var

**Test**:
```typescript
// In browser console
import API_CONFIG from '@/lib/config'
console.log(API_CONFIG) // Should show all settings
```

### Enhanced API Client (apps/web/lib/api-client.ts)
- [ ] apiClient created with baseURL from API_CONFIG.BASE_URL
- [ ] Request interceptor adds Bearer token from localStorage
- [ ] Response interceptor handles 401 status
- [ ] 401 handler clears localStorage tokens
- [ ] 401 handler redirects to /login (except on login page itself)
- [ ] Error responses properly propagated

**Test**:
```bash
# Test 401 handling
cd apps/web
# 1. Login
# 2. Clear token from localStorage: localStorage.removeItem('token')
# 3. Make API call - should redirect to /login
```

## Frontend Features

### Food Detail Page (apps/web/pages/food/[id].tsx)
- [ ] File created at pages/food/[id].tsx
- [ ] Dynamic routing works: /food/[any-id]
- [ ] Fetches food details on component mount
- [ ] Displays: name, price, country, category, description
- [ ] Seller info section with rating & verified badge
- [ ] Dietary restrictions displayed as badges
- [ ] Quantity selector with +/- buttons
- [ ] Add to cart button (logs to console)
- [ ] Message seller button navigates to messages
- [ ] Loading state shows spinner
- [ ] Error state shows error message
- [ ] Back to search link visible

**Test**:
```bash
# 1. Run dev server: pnpm dev
# 2. Navigate to http://localhost:3000/search
# 3. Click on any food item
# 4. Should see full details page
# 5. Test quantity selector works
# 6. Test add to cart shows message
```

### Error Handling (apps/web/lib/errors.ts)
- [ ] APIError class with statusCode, message, details
- [ ] formatErrorResponse() handles axios errors
- [ ] retryWithBackoff() implements exponential backoff
- [ ] isRetryableError() checks status codes correctly
- [ ] 429/503/504 are retryable
- [ ] 4xx errors not retried (except 429/503)

**Test**:
```typescript
// In Next.js page or component
import { retryWithBackoff } from '@/lib/errors'

const result = await retryWithBackoff(
  () => apiClient.get('/foods'),
  3,
  1000
)
```

### Utilities (apps/web/lib/utils.ts)
- [ ] debounce() function works for search delays
- [ ] formatCurrency() formats with EUR
- [ ] formatDate() shows EU date format
- [ ] formatFileSize() converts bytes
- [ ] useAsyncData() handles retries

**Test**:
```typescript
import { debounce, formatCurrency } from '@/lib/utils'

const debouncedSearch = debounce((query) => {
  console.log('Searching:', query)
}, 500)

console.log(formatCurrency(24.99)) // €24.99
```

## Backend Infrastructure

### Spring Boot Entities
Each entity verified with:

#### User.java
- [ ] Annotations: @Entity, @Table, @Data, @NoArgsConstructor, @AllArgsConstructor
- [ ] All required fields with validation
- [ ] @PrePersist sets createdAt, updatedAt
- [ ] @PreUpdate updates updatedAt
- [ ] Role enum defined (BUYER, SELLER, ADMIN)

#### Food.java
- [ ] Foreign key to User (seller_id)
- [ ] @ManyToOne lazy loading
- [ ] JSONB columns for dietary_restrictions and images
- [ ] Price and finderFee with @Min validation
- [ ] Timestamps with @PrePersist/@PreUpdate

#### Order.java
- [ ] Foreign keys: buyerId, sellerId, foodId
- [ ] Status enum (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
- [ ] Total price calculation fields
- [ ] Tracking and shipping info
- [ ] Completion timestamp

#### Review.java
- [ ] Rating with @Min(1) @Max(5) validation
- [ ] Foreign keys for food, reviewer, seller
- [ ] Verified flag for purchase verification
- [ ] JSONB for highlights and improvements

**Compile Test**:
```bash
cd services/core-service
mvn clean compile
# Should complete without errors
```

### Spring Data JPA Repositories

#### UserRepository
- [ ] findByEmail() method
- [ ] findByAuth0Sub() method
- [ ] findTopSellers() with rating sort
- [ ] findSellersByCountry() query
- [ ] Count queries for metrics

#### FoodRepository
- [ ] Pagination support via Pageable
- [ ] Search methods (category, country, full-text)
- [ ] Trending/discovery queries
- [ ] Count methods for analytics

#### OrderRepository
- [ ] Buyer and seller order queries
- [ ] Status-based filtering
- [ ] Revenue calculation query
- [ ] Completion date filtering

#### ReviewRepository
- [ ] Food and seller review queries
- [ ] Average rating calculations
- [ ] Duplicate prevention check

**Test**:
```bash
mvn clean test -Dtest=*RepositoryTest
```

### Updated Error Handler (services/api-gateway/src/middleware/error-handler.ts)
- [ ] authMiddleware is async function
- [ ] Checks Authorization header
- [ ] Attempts Auth0 verification if configured
- [ ] Falls back to mock token parsing
- [ ] Attaches userId and user to request
- [ ] Returns proper 401 on failure
- [ ] Logs errors for debugging

## API Gateway Routes

### Food Endpoints (should work with mock data)
- [ ] GET /api/foods - List foods with pagination
- [ ] GET /api/foods/search?q=query - Search foods
- [ ] GET /api/foods/trending - Trending foods
- [ ] GET /api/foods/:id - Food details
- [ ] POST /api/foods - Create (requires auth)
- [ ] PUT /api/foods/:id - Update (requires auth)
- [ ] DELETE /api/foods/:id - Delete (requires auth)

**Test**:
```bash
# Start services
pnpm dev

# Test endpoints
curl http://localhost:3001/api/foods
curl http://localhost:3001/api/foods/search?q=chocolate
```

### Auth Endpoints
- [ ] POST /api/auth/login - Authenticate user
- [ ] POST /api/auth/signup - Create account
- [ ] POST /api/auth/logout - Clear session
- [ ] GET /api/auth/me - Get current user (requires auth)
- [ ] POST /api/auth/verify - Verify token

## Environment Setup

### Frontend .env.local
Check file exists with:
```bash
cat apps/web/.env.local | grep -E "(NEXT_PUBLIC|API)"
```

- [ ] NEXT_PUBLIC_API_URL set
- [ ] NEXT_PUBLIC_AUTH0_DOMAIN set (or empty for mock mode)
- [ ] NEXT_PUBLIC_AUTH0_CLIENT_ID set (or empty for mock mode)
- [ ] NEXT_PUBLIC_USE_MOCK_AUTH controls auth mode

### Backend .env
Check file exists with:
```bash
cat services/api-gateway/.env | grep -E "(AUTH0|DATABASE|REDIS)"
```

- [ ] AUTH0_DOMAIN configured
- [ ] DATABASE_URL points to PostgreSQL
- [ ] REDIS_URL points to Redis
- [ ] NODE_ENV set to 'development'

## Integration Tests

### Full Authentication Flow
1. [ ] Signup page accessible at /signup
2. [ ] User can enter email, password, name, country
3. [ ] Submit creates user (returns token in response)
4. [ ] Token stored in localStorage
5. [ ] Redirect to /dashboard after signup
6. [ ] Dashboard shows user info
7. [ ] Logout button clears localStorage
8. [ ] Redirect to / after logout

### Food Discovery Flow
1. [ ] Landing page at / shows trending foods
2. [ ] Search page at /search allows filtering
3. [ ] Search results clickable
4. [ ] Click leads to /food/[id] detail page
5. [ ] Detail page loads food info
6. [ ] Add to cart shows success message
7. [ ] Message seller button works

### Error Handling
1. [ ] Invalid credentials on login show error
2. [ ] Expired token triggers redirect to /login
3. [ ] Network errors show retry message
4. [ ] Invalid food ID shows not found page

## Performance Checks

### API Response Times
- [ ] /api/foods loads in < 500ms
- [ ] /api/foods/:id loads in < 300ms
- [ ] Search queries return in < 1s

### Frontend Load Time
- [ ] Landing page loads in < 2s
- [ ] Detail page loads in < 2s
- [ ] No unnecessary re-renders in DevTools Profiler

### Database Queries
- [ ] Use indexes for common queries
- [ ] No N+1 query problems
- [ ] Pagination limits result sets

**Test**:
```bash
# Monitor database queries
docker-compose logs -f postgres | grep "duration:"
```

## Browser DevTools Checks

### Network Tab
- [ ] Authorization header present on protected routes
- [ ] Bearer token format correct
- [ ] CORS headers allow frontend domain
- [ ] API responses JSON formatted

### Console
- [ ] No TypeScript errors
- [ ] No 404 errors for resources
- [ ] Debug logs visible if DEBUG_MODE=true
- [ ] No infinite redirect loops

### Application/Storage
- [ ] token in localStorage after login
- [ ] user JSON object in localStorage
- [ ] Cleared after logout

## Deployment Readiness

- [ ] All environment variables documented
- [ ] Sensitive values not in git
- [ ] TypeScript compiles without errors
- [ ] Unit tests passing
- [ ] No console.log() statements in production code
- [ ] Error messages don't leak sensitive info

## Sign-Off

| Component | Verified | Issues | Notes |
|-----------|----------|--------|-------|
| Auth0 Library | ☐ | | |
| API Config | ☐ | | |
| API Client | ☐ | | |
| Food Detail Page | ☐ | | |
| Error Handling | ☐ | | |
| User Entity | ☐ | | |
| Food Entity | ☐ | | |
| Order Entity | ☐ | | |
| Review Entity | ☐ | | |
| Repositories | ☐ | | |
| Auth Middleware | ☐ | | |
| Auth Endpoints | ☐ | | |
| Food Endpoints | ☐ | | |
| Environment Config | ☐ | | |

**Completion Target**: All boxes checked before proceeding to Phase 3

---

*Last Updated*: 2024  
*Next Phase*: Spring Boot Controllers Implementation
