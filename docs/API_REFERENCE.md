# EU Specialty Food Marketplace - API Reference (Phase 2)

**Base URL:** `http://localhost:8080/api`
**Authentication:** Bearer token in `Authorization` header or `X-User-Id` header for user context

## Table of Contents
1. [User Management](#user-management)
2. [Food Products](#food-products)
3. [Orders](#orders)
4. [Reviews](#reviews)
5. [Conversations & Messages](#conversations--messages)
6. [Notifications](#notifications)

---

## User Management

### Get Current User Profile
```
GET /api/users
Headers: X-User-Id: {userId}
Response: 200 OK
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "buyer@example.com",
    "name": "Jean Dupont",
    "country": "FR",
    "role": "buyer",
    "average_rating": 0.0,
    "review_count": 0,
    "completed_orders": 12,
    "profile_bio": "Food enthusiast",
    "kyc_verified": false
  }
}
```

### Get User by ID
```
GET /api/users/{id}
Response: 200 OK
{
  "success": true,
  "data": {
    "id": "seller-456",
    "email": "seller@example.com",
    "name": "Belgian Chocolates Ltd",
    "country": "BE",
    "role": "seller",
    "average_rating": 4.8,
    "review_count": 45,
    "completed_orders": 128,
    "profile_bio": "Premium Belgian chocolate manufacturer"
  }
}
```

### Get Top 10 Sellers
```
GET /api/users/sellers/top
Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "seller-1",
      "name": "Italian Delights",
      "country": "IT",
      "average_rating": 4.9,
      "review_count": 67,
      "profile_bio": "Authentic Italian specialty foods"
    },
    // ... more sellers
  ]
}
```

### Upgrade to Seller
```
POST /api/users/{id}/become-seller
Headers: X-User-Id: {userId}
Response: 200 OK
{
  "success": true,
  "data": {
    "id": "user-123",
    "role": "seller",
    "name": "New Seller"
  },
  "message": "User upgraded to seller"
}
```

---

## Food Products

### Search Foods
```
GET /api/foods?query=chocolate&country=BE&category=Chocolates&page=0&size=20
Query Parameters:
  - query: Search term (optional)
  - country: Country code (optional)
  - category: Food category (optional)
  - page: Page number (default: 0)
  - size: Results per page (default: 20)

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "food-123",
      "name": "Belgian Chocolate Truffles",
      "description": "Dark chocolate truffles with ganache",
      "price": 24.99,
      "finder_fee": 5.00,
      "country": "BE",
      "category": "Chocolates",
      "quantity": 100,
      "available": true,
      "average_rating": 4.8,
      "review_count": 12,
      "sales_count": 45,
      "view_count": 320,
      "seller": {
        "id": "seller-1",
        "name": "Belgian Chocolates Ltd",
        "average_rating": 4.8
      }
    },
    // ... more foods
  ]
}
```

### Get Trending Foods by Country
```
GET /api/foods/trending?country=IT
Query Parameters:
  - country: Country code (required)
  - Returns: Top 10 foods by rating

Response: 200 OK
{
  "success": true,
  "data": [
    // Same format as search results
  ]
}
```

### Get Food Detail
```
GET /api/foods/{id}
Response: 200 OK
{
  "success": true,
  "data": {
    "id": "food-123",
    "name": "Belgian Chocolate Truffles",
    // ... full food details
    "dietary_restrictions": ["gluten-free", "vegan"],
    "images": ["url1", "url2"],
    "view_count": 321  // Incremented on access
  }
}
```

### Create New Food (Seller Only)
```
POST /api/foods
Headers: X-User-Id: {sellerId}
Body:
{
  "name": "Premium Belgian Pralines",
  "description": "Assorted Belgian pralines",
  "category": "Chocolates",
  "price": 32.99,
  "finder_fee": 6.50,
  "country": "BE",
  "quantity": 75,
  "dietary_restrictions": ["gluten-free"],
  "images": ["url1", "url2"]
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "food-new",
    "name": "Premium Belgian Pralines",
    "seller_id": "seller-1",
    "available": true,
    // ... created food details
  },
  "message": "Food created successfully"
}
```

### Update Food (Seller Only - Own Products)
```
PUT /api/foods/{id}
Headers: X-User-Id: {sellerId}
Body:
{
  "name": "Updated Name",
  "price": 29.99,
  "quantity": 50,
  // ... only specified fields are updated
}

Response: 200 OK
{
  "success": true,
  "data": { /* updated food */ }
}
```

### Delete Food (Seller Only - Own Products)
```
DELETE /api/foods/{id}
Headers: X-User-Id: {sellerId}

Response: 204 No Content
```

---

## Orders

### Create Order
```
POST /api/orders
Headers: X-User-Id: {buyerId}
Body:
{
  "food_id": "food-123",
  "quantity": 2,
  "total_price": 49.98,
  "notes": "Optional delivery notes"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "order-new",
    "buyer_id": "buyer-1",
    "food_id": "food-123",
    "quantity": 2,
    "total_price": 49.98,
    "status": "PENDING",
    "created_at": "2024-01-15T10:30:00Z",
    "completed_at": null
  },
  "message": "Order created successfully"
}
```

### Get Order Detail
```
GET /api/orders/{id}
Response: 200 OK
{
  "success": true,
  "data": {
    "id": "order-123",
    "buyer_id": "buyer-1",
    "food_id": "food-123",
    "food_name": "Belgian Chocolate Truffles",
    "quantity": 2,
    "total_price": 49.98,
    "status": "DELIVERED",
    "created_at": "2024-01-10T10:30:00Z",
    "completed_at": "2024-01-15T14:20:00Z"
  }
}
```

### Get Orders by Buyer
```
GET /api/orders/buyer/{buyerId}
Response: 200 OK
{
  "success": true,
  "data": [
    // List of orders for buyer
  ]
}
```

### Get Orders by Seller
```
GET /api/orders/seller/{sellerId}
Response: 200 OK
{
  "success": true,
  "data": [
    // List of orders for seller's products
  ]
}
```

### Update Order Status
```
PUT /api/orders/{id}/status
Headers: X-User-Id: {userId}
Body:
{
  "status": "CONFIRMED"  // PENDING → CONFIRMED → SHIPPED → DELIVERED
}

Valid transitions:
- PENDING → CONFIRMED (seller)
- CONFIRMED → SHIPPED (seller)
- SHIPPED → DELIVERED (seller)
- Any status → CANCELLED (buyer, only if PENDING/CONFIRMED)

Response: 200 OK
{
  "success": true,
  "data": { /* updated order */ }
}
```

### Cancel Order
```
POST /api/orders/{id}/cancel
Headers: X-User-Id: {buyerId}
Requirements:
- Status must be PENDING or CONFIRMED
- Buyer must own the order

Response: 200 OK
{
  "success": true,
  "data": { /* cancelled order */ },
  "message": "Order cancelled successfully"
}
```

### Get Seller Revenue
```
GET /api/orders/seller/{sellerId}/revenue
Calculation: Sum of all DELIVERED orders

Response: 200 OK
{
  "success": true,
  "data": {
    "seller_id": "seller-1",
    "total_revenue": 4250.50,
    "delivered_orders": 32
  }
}
```

---

## Reviews

### Create Review
```
POST /api/reviews
Headers: X-User-Id: {buyerId}
Body:
{
  "food_id": "food-123",
  "buyer_id": "buyer-1",
  "rating": 5,  // 1-5
  "comment": "Excellent product! Fresh and delicious."
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "review-new",
    "food_id": "food-123",
    "buyer_id": "buyer-1",
    "rating": 5,
    "comment": "Excellent product! Fresh and delicious.",
    "created_at": "2024-01-15T15:45:00Z"
  },
  "message": "Review created successfully"
}
```

### Get Reviews for Food
```
GET /api/reviews/food/{foodId}
Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "review-1",
      "food_id": "food-123",
      "buyer_name": "Jean Dupont",
      "rating": 5,
      "comment": "Excellent product!",
      "created_at": "2024-01-15T15:45:00Z"
    },
    // ... more reviews, newest first
  ]
}
```

### Get Average Rating for Food
```
GET /api/reviews/food/{foodId}/average-rating
Response: 200 OK
{
  "success": true,
  "data": 4.75  // Average rating
}
```

### Get Reviews by Buyer
```
GET /api/reviews/buyer/{buyerId}
Response: 200 OK
{
  "success": true,
  "data": [
    // List of reviews left by buyer
  ]
}
```

### Update Review
```
PUT /api/reviews/{id}
Headers: X-User-Id: {buyerId}
Body:
{
  "rating": 4,
  "comment": "Good product, but packaging could be better"
}

Requirements:
- Buyer must own the review

Response: 200 OK
{
  "success": true,
  "data": { /* updated review */ }
}
```

### Delete Review
```
DELETE /api/reviews/{id}
Headers: X-User-Id: {buyerId}

Requirements:
- Buyer must own the review

Response: 204 No Content
```

---

## Conversations & Messages

### Start Conversation
```
POST /api/conversations
Headers: X-User-Id: {buyerId}
Body:
{
  "buyer_id": "buyer-1",
  "seller_id": "seller-1",
  "subject": "Questions about your Belgian Chocolates"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "conv-new",
    "buyer_id": "buyer-1",
    "seller_id": "seller-1",
    "subject": "Questions about your Belgian Chocolates",
    "last_message": null,
    "last_message_at": null,
    "is_active": true,
    "created_at": "2024-01-15T16:00:00Z"
  },
  "message": "Conversation created"
}
```

### Get Conversation Detail
```
GET /api/conversations/{id}
Response: 200 OK
{
  "success": true,
  "data": {
    "id": "conv-123",
    "buyer_name": "Jean Dupont",
    "seller_name": "Belgian Chocolates Ltd",
    "subject": "Questions about your Belgian Chocolates",
    "last_message": "Do you offer bulk discounts?",
    "last_message_at": "2024-01-15T16:30:00Z",
    "is_active": true
  }
}
```

### Get Conversations for Buyer
```
GET /api/conversations/buyer/{buyerId}
Response: 200 OK
{
  "success": true,
  "data": [
    // List of conversations, newest first
  ]
}
```

### Get Conversations for Seller
```
GET /api/conversations/seller/{sellerId}
Response: 200 OK
{
  "success": true,
  "data": [
    // List of conversations, newest first
  ]
}
```

### Get Active Conversations
```
GET /api/conversations/user/{userId}/active
Response: 200 OK
{
  "success": true,
  "data": [
    // Conversations where is_active=true
  ]
}
```

### Add Message to Conversation
```
POST /api/conversations/{id}/messages
Headers: X-User-Id: {senderId}
Body:
{
  "content": "Do you offer bulk discounts for orders over 100 units?"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "conv-123",
    "last_message": "Do you offer bulk discounts for orders over 100 units?",
    "last_message_at": "2024-01-15T16:45:00Z"
  },
  "message": "Message added"
}
```

### Get Conversation History
```
GET /api/conversations/{id}/messages
Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "msg-1",
      "sender_id": "buyer-1",
      "sender_name": "Jean Dupont",
      "content": "Hi, do you offer wholesale?",
      "is_read": true,
      "created_at": "2024-01-15T16:00:00Z"
    },
    {
      "id": "msg-2",
      "sender_id": "seller-1",
      "sender_name": "Belgian Chocolates Ltd",
      "content": "Yes, we do! What quantities are you interested in?",
      "is_read": true,
      "created_at": "2024-01-15T16:15:00Z"
    }
    // ... more messages in chronological order
  ]
}
```

### Close Conversation
```
DELETE /api/conversations/{id}
Headers: X-User-Id: {userId}

Sets is_active=false to archive conversation

Response: 204 No Content
```

---

## Notifications

### Get All Notifications
```
GET /api/notifications
Headers: X-User-Id: {userId}
Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "notif-1",
      "type": "ORDER_DELIVERED",
      "title": "Order Delivered",
      "message": "Your order of Belgian Chocolate Truffles has been delivered!",
      "related_id": "order-123",
      "is_read": true,
      "created_at": "2024-01-15T14:20:00Z"
    },
    // ... more notifications, newest first
  ]
}
```

### Get Unread Notifications
```
GET /api/notifications/unread
Headers: X-User-Id: {userId}
Response: 200 OK
{
  "success": true,
  "data": [
    // Only notifications with is_read=false
  ]
}
```

### Get Unread Count
```
GET /api/notifications/unread/count
Headers: X-User-Id: {userId}
Response: 200 OK
{
  "success": true,
  "data": 5  // Number of unread notifications
}
```

### Get Notification Detail
```
GET /api/notifications/{id}
Response: 200 OK
{
  "success": true,
  "data": { /* notification details */ }
}
```

### Mark Notification as Read
```
POST /api/notifications/{id}/read
Headers: X-User-Id: {userId}
Response: 200 OK
{
  "success": true,
  "message": "Notification marked as read"
}
```

### Mark All as Read
```
POST /api/notifications/read-all
Headers: X-User-Id: {userId}
Response: 200 OK
{
  "success": true,
  "message": "All notifications marked as read"
}
```

### Delete Notification
```
DELETE /api/notifications/{id}
Headers: X-User-Id: {userId}
Response: 204 No Content
```

---

## Notification Types

- `ORDER_CREATED` - New order placed
- `ORDER_CONFIRMED` - Order confirmed by seller
- `ORDER_SHIPPED` - Order shipped
- `ORDER_DELIVERED` - Order delivered
- `ORDER_CANCELLED` - Order cancelled
- `NEW_REVIEW` - New review received (seller notification)
- `NEW_MESSAGE` - New message in conversation
- `SELLER_UPGRADED` - User became a seller
- `LOW_STOCK` - Product stock running low

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": "Descriptive error message",
  "statusCode": 400  // or 401, 403, 404, 500, etc.
}
```

### Common HTTP Status Codes
- `200 OK` - Request successful
- `201 Created` - Resource created
- `204 No Content` - Request successful, no content
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - User lacks permission
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Response Format

All successful responses follow this format:

```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

Paginated responses include:

```json
{
  "success": true,
  "data": [ /* array of items */ ],
  "page": 0,
  "size": 20,
  "total": 150,
  "totalPages": 8
}
```

---

## Example Complete Flow

1. **User Signup** → Creates buyer account
2. **Browse Products** → GET /api/foods with filters
3. **View Detail** → GET /api/foods/{id}
4. **Create Order** → POST /api/orders
5. **Message Seller** → POST /api/conversations (start) → POST /api/conversations/{id}/messages
6. **Leave Review** → POST /api/reviews after delivery
7. **Check Notifications** → GET /api/notifications

---

*Last Updated: Phase 2 Completion*
*Version: 2.0 - Full Implementation*
