# EUshop API Documentation

## API Gateway Overview

The API Gateway (Node.js/Express) is the central entry point for all client requests. It handles authentication, routing, and service orchestration.

**Base URL**: `http://localhost:3001/api` (development)

## Authentication Endpoints

### Login
Creates a session for a user with email and password.

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJzdWIiOiJ1c2VyXzEyMyIsImVtYWlsIjoicmFwdGEuY29zcmlkQGdtYWlsLmNvbSJ9",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "buyer"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Invalid login credentials",
  "details": "Email or password incorrect"
}
```

---

### Signup
Register a new user account.

```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "Jane Smith",
  "country": "Belgium"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "user": {
    "id": "user_new_456",
    "email": "newuser@example.com",
    "name": "Jane Smith",
    "country": "Belgium",
    "role": "buyer",
    "verified": false
  },
  "token": "eyJzdWIiOiJ1c2VyX25ld180NTYiLCJlbWFpbCI6Im5ld3VzZXJAZXhhbXBsZS5jb20ifQ==",
  "message": "User created successfully. Please verify your email."
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Invalid registration data",
  "details": "Email already exists"
}
```

---

### Verify Token
Verify the validity of an authentication token.

```http
POST /api/auth/verify
Content-Type: application/json

{
  "token": "eyJzdWIiOiJ1c2VyXzEyMyIsImVtYWlsIjoicmFwdGEuY29zcmlkQGdtYWlsLmNvbSJ9"
}
```

**Response (200 OK):**
```json
{
  "valid": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "valid": false,
  "error": "Invalid token",
  "details": "Token decoding failed"
}
```

---

### Get Current User
Retrieve authenticated user profile.

```http
GET /api/auth/me
Authorization: Bearer eyJzdWIiOiJ1c2VyXzEyMyIsImVtYWlsIjoicmFwdGEuY29zcmlkQGdtYWlsLmNvbSJ9
```

**Response (200 OK):**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "role": "buyer"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Unauthorized"
}
```

---

### Logout
Invalidate current session (client-side implementation).

```http
POST /api/auth/logout
Authorization: Bearer eyJzdWIiOiJ1c2VyXzEyMyIsImVtYWlsIjoicmFwdGEuY29zcmlkQGdtYWlsLmNvbSJ9
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Food Endpoints

### Search Foods
Search and filter specialty foods by query and country.

```http
GET /api/foods?search=Belgian&country=Belgium&page=1&limit=20
Authorization: Bearer <TOKEN>
```

**Query Parameters:**
- `search` (string, optional): Search term for food name/description
- `country` (string, optional): Filter by country
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Results per page (default: 20)

**Response (200 OK):**
```json
{
  "foods": [
    {
      "id": "food_1",
      "name": "Belgian Chocolate Truffles",
      "country": "Belgium",
      "price": 24.99,
      "description": "Premium dark chocolate truffles",
      "sellerId": "seller_1",
      "category": "Chocolate",
      "dietary": ["vegan"],
      "is_active": true
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 20
}
```

---

### Get Food Detail
Retrieve detailed information about a specific food item.

```http
GET /api/foods/:id
Authorization: Bearer <TOKEN>
```

**Response (200 OK):**
```json
{
  "id": "food_1",
  "name": "Belgian Chocolate Truffles",
  "description": "Premium dark chocolate truffles handmade in Brussels",
  "country": "Belgium",
  "price": 24.99,
  "category": "Chocolate",
  "seller": {
    "id": "seller_1",
    "name": "Brussels Chocolaterie",
    "country": "Belgium",
    "rating": 4.8,
    "verified": true
  },
  "dietary_restrictions": ["vegan", "gluten-free"],
  "images": ["https://..."],
  "finder_fee": 2.50,
  "created_at": "2025-05-02T08:00:00Z"
}
```

---

### Get Trending Foods
Retrieve currently trending food items.

```http
GET /api/foods/trending
Authorization: Bearer <TOKEN>
```

**Response (200 OK):**
```json
{
  "foods": [
    {
      "id": "food_1",
      "name": "Belgian Chocolates",
      "country": "Belgium",
      "price": 24.99
    },
    {
      "id": "food_2",
      "name": "Italian Balsamic",
      "country": "Italy",
      "price": 34.99
    }
  ]
}
```

---

## Health Check

### Check API Gateway Status

```http
GET /api/health
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "service": "API Gateway",
  "timestamp": "2025-05-02T12:30:45Z",
  "uptime": 3600
}
```

### Check All Dependencies

```http
GET /api/health/detailed
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "service": "API Gateway",
  "timestamp": "2025-05-02T12:30:45Z",
  "dependencies": {
    "postgresql": "ok",
    "redis": "ok",
    "elasticsearch": "ok",
    "core_service": "ok"
  }
}
```

---

## Middleware & Authentication

All protected endpoints require the `Authorization` header with a Bearer token:

```http
Authorization: Bearer <TOKEN>
```

**Token Format** (Phase 1 - Mock):
Base64 encoded JSON object containing:
```json
{
  "sub": "user_123",
  "email": "user@example.com"
}
```

**Future (Phase 2)**: Will use Auth0 JWT with RS256 signature verification.

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error type",
  "message": "Human readable error description",
  "details": "Additional context if available"
}
```

### Common HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data or validation error
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Authenticated but insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error
- **503 Service Unavailable**: Dependency service is down

---

## Request/Response Examples

### cURL Examples

**Signup:**
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "pass123",
    "name": "Test User",
    "country": "Belgium"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "pass123"
  }'
```

**Search Foods (requires token):**
```bash
curl -X GET "http://localhost:3001/api/foods?search=chocolate&country=Belgium" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Rate Limiting

Currently no rate limiting implemented. Phase 2 will include:
- Per-user rate limits (100 requests/minute)
- IP-based rate limiting
- Exponential backoff for retries

---

## Pagination

List endpoints support pagination:

```
GET /api/foods?page=2&limit=50
```

Response includes pagination metadata:
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 50,
    "total": 250,
    "total_pages": 5,
    "has_next": true,
    "has_prev": true
  }
}
```

---

## Future Endpoints (Phase 2+)

### Messaging
- `POST /api/messages` - Send message
- `GET /api/messages/:conversationId` - Retrieve conversation
- `WS /ws/messages` - WebSocket connection for real-time messaging

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id` - Update order status

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/:sellerId` - Get seller reviews

### Sellers
- `POST /api/sellers` - Become a seller
- `GET /api/sellers/:id` - Get seller profile
- `PATCH /api/sellers/:id` - Update seller profile

### Payments
- `POST /api/payments` - Initiate payment
- `GET /api/payments/:id` - Get payment status
- `POST /api/payments/:id/complete` - Complete payment

---

## GraphQL Endpoint (Future)

Phase 2 will include GraphQL support at `/api/graphql` for complex queries and efficient data fetching.

---

## Support & Issues

For API issues:
1. Check error response details
2. Verify authentication token is valid
3. Ensure required fields are provided
4. Check server logs: `docker-compose logs api-gateway`
5. Contact development team

## Version

Current Version: 1.0 (Phase 1)
Next Update: Phase 2 (Auth0, Payments, Messaging)
