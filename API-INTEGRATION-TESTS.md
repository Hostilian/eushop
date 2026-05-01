# API Integration Tests

Complete test suite for validating all REST endpoints.

## Prerequisites

```bash
# Start the system
./demo-setup.sh  # or demo-setup.bat

# Get a test token (optional, mock auth works)
export TOKEN="eyJzdWIiOiJ1c2VyLTEyMyIsImVtYWlsIjoic2VsbGVyMUBleGFtcGxlLmNvbSIsImV4cCI6OTk5OTk5OTk5OX0="
```

---

## 1. Food Endpoints

### 1.1 List All Foods
```bash
curl -i http://localhost:3001/api/foods
```
**Expected**: 200 OK, array of food objects with pagination

### 1.2 Search Foods by Query
```bash
curl -i "http://localhost:3001/api/foods?query=chocolate"
```
**Expected**: 200 OK, foods matching "chocolate"

### 1.3 Filter by Country
```bash
curl -i "http://localhost:3001/api/foods?country=BE"
```
**Expected**: 200 OK, foods from Belgium

### 1.4 Filter by Category
```bash
curl -i "http://localhost:3001/api/foods?category=chocolate"
```
**Expected**: 200 OK, chocolate products

### 1.5 Pagination
```bash
curl -i "http://localhost:3001/api/foods?page=0&size=5"
```
**Expected**: 200 OK, first 5 foods

### 1.6 Get Trending Foods
```bash
curl -i "http://localhost:3001/api/foods/trending?country=BE"
```
**Expected**: 200 OK, top 10 foods by rating

### 1.7 Get Food by ID
```bash
curl -i "http://localhost:3001/api/foods/1"
```
**Expected**: 200 OK, single food object

### 1.8 Get Food by Invalid ID
```bash
curl -i "http://localhost:3001/api/foods/999999"
```
**Expected**: 404 Not Found

### 1.9 Create Food (Requires Auth)
```bash
curl -i -X POST http://localhost:3001/api/foods \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Chocolate",
    "description": "Delicious dark chocolate",
    "price": 12.99,
    "finderFee": 2.00,
    "country": "BE",
    "category": "chocolate",
    "quantity": 100,
    "dietaryRestrictions": ["vegan"]
  }'
```
**Expected**: 201 Created, returns created food object

### 1.10 Create Food Without Auth
```bash
curl -i -X POST http://localhost:3001/api/foods \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'
```
**Expected**: 401 Unauthorized

### 1.11 Update Food
```bash
curl -i -X PUT http://localhost:3001/api/foods/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Updated Name", "price": 15.99}'
```
**Expected**: 200 OK, returns updated food

### 1.12 Delete Food
```bash
curl -i -X DELETE http://localhost:3001/api/foods/1 \
  -H "Authorization: Bearer $TOKEN"
```
**Expected**: 204 No Content

---

## 2. User Endpoints

### 2.1 Get User Profile by ID
```bash
curl -i http://localhost:3001/api/users/1
```
**Expected**: 200 OK, user profile with public info

### 2.2 Get Current User
```bash
curl -i http://localhost:3001/api/users \
  -H "Authorization: Bearer $TOKEN"
```
**Expected**: 200 OK, current user's full profile

### 2.3 Get All Users
```bash
curl -i http://localhost:3001/api/users
```
**Expected**: 200 OK, list of users (public info only)

### 2.4 Get Top Sellers
```bash
curl -i http://localhost:3001/api/users/sellers/top
```
**Expected**: 200 OK, top 10 sellers by rating

### 2.5 Become Seller (Upgrade Account)
```bash
curl -i -X POST http://localhost:3001/api/users/1/become-seller \
  -H "Authorization: Bearer $TOKEN"
```
**Expected**: 200 OK, user role changed to SELLER

### 2.6 Non-existent User
```bash
curl -i http://localhost:3001/api/users/999999
```
**Expected**: 404 Not Found

---

## 3. Order Endpoints

### 3.1 Create Order
```bash
curl -i -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "foodId": "1",
    "quantity": 2,
    "totalPrice": 25.98
  }'
```
**Expected**: 201 Created, order with PENDING status

### 3.2 List Orders
```bash
curl -i http://localhost:3001/api/orders
```
**Expected**: 200 OK, list of orders

### 3.3 Get Order by ID
```bash
curl -i http://localhost:3001/api/orders/1
```
**Expected**: 200 OK, single order

### 3.4 Update Order Status
```bash
curl -i -X PUT http://localhost:3001/api/orders/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status": "CONFIRMED"}'
```
**Expected**: 200 OK, order status updated

### 3.5 Valid Status Transitions
```bash
# PENDING → CONFIRMED
curl -i -X PUT http://localhost:3001/api/orders/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status": "CONFIRMED"}'

# CONFIRMED → SHIPPED
curl -i -X PUT http://localhost:3001/api/orders/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status": "SHIPPED"}'

# SHIPPED → DELIVERED
curl -i -X PUT http://localhost:3001/api/orders/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status": "DELIVERED"}'
```
**Expected**: 200 OK for each

### 3.6 Cancel Order
```bash
curl -i -X POST http://localhost:3001/api/orders/1/cancel \
  -H "Authorization: Bearer $TOKEN"
```
**Expected**: 200 OK (only if PENDING or CONFIRMED)

### 3.7 Cancel Non-Cancelable Order
```bash
# Try to cancel DELIVERED order
curl -i -X POST http://localhost:3001/api/orders/1/cancel \
  -H "Authorization: Bearer $TOKEN"
```
**Expected**: 400 Bad Request (cannot cancel delivered order)

---

## 4. Error Handling Tests

### 4.1 Missing Required Fields
```bash
curl -i -X POST http://localhost:3001/api/foods \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"description": "No name provided"}'
```
**Expected**: 400 Bad Request with validation error

### 4.2 Invalid JSON
```bash
curl -i -X POST http://localhost:3001/api/foods \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{invalid json'
```
**Expected**: 400 Bad Request

### 4.3 Invalid Authorization Header
```bash
curl -i http://localhost:3001/api/users \
  -H "Authorization: Bearer invalid_token"
```
**Expected**: 401 Unauthorized

### 4.4 Missing Authorization Header
```bash
curl -i -X POST http://localhost:3001/api/foods \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'
```
**Expected**: 401 Unauthorized

---

## 5. Database Verification

### 5.1 Check Users Table
```bash
docker-compose exec postgres psql -U postgres -d eushop -c "SELECT id, email, role FROM users;"
```
**Expected**: 3+ users (buyer, sellers)

### 5.2 Check Foods Table
```bash
docker-compose exec postgres psql -U postgres -d eushop -c "SELECT id, name, seller_id, price FROM foods LIMIT 10;"
```
**Expected**: 9+ foods with sellers

### 5.3 Check Orders Table
```bash
docker-compose exec postgres psql -U postgres -d eushop -c "SELECT id, food_id, buyer_id, status FROM orders;"
```
**Expected**: Orders created during tests

### 5.4 Check Relationships
```bash
docker-compose exec postgres psql -U postgres -d eushop -c "
  SELECT f.name as food, u.name as seller, f.price 
  FROM foods f 
  JOIN users u ON f.seller_id = u.id 
  LIMIT 5;"
```
**Expected**: Foods matched with seller names

### 5.5 Check Indexes
```bash
docker-compose exec postgres psql -U postgres -d eushop -c "SELECT * FROM pg_indexes WHERE tablename IN ('foods', 'orders', 'users');"
```
**Expected**: Indexes present on key columns

---

## 6. Performance Tests

### 6.1 Search Performance
```bash
time curl -s "http://localhost:3001/api/foods?query=chocolate" > /dev/null
```
**Expected**: < 500ms

### 6.2 Pagination Performance
```bash
time curl -s "http://localhost:3001/api/foods?page=0&size=100" > /dev/null
```
**Expected**: < 1 second

### 6.3 List All Foods
```bash
time curl -s "http://localhost:3001/api/foods?page=0&size=1000" > /dev/null
```
**Expected**: < 2 seconds

### 6.4 Top Sellers Query
```bash
time curl -s "http://localhost:3001/api/users/sellers/top" > /dev/null
```
**Expected**: < 500ms

---

## 7. Browser Testing (Manual)

### 7.1 Landing Page
- Visit http://localhost:3000
- See featured foods displayed
- Click on food item to see detail page
- All images load correctly
- Navigation works

### 7.2 Search Functionality
- Search for "chocolate"
- Results display correctly
- Pagination controls work
- Filters (country, category) work
- Loading state shows during search

### 7.3 Product Detail
- Click on any food item
- Detail page loads with full info
- Seller name and profile link visible
- Price, quantity, availability shown
- Add to cart button works
- Message seller button works

### 7.4 Authentication
- Click "Sign Up"
- Fill form and submit
- New account created
- Redirected to dashboard
- Profile information saved

### 7.5 Dashboard
- View user profile information
- Edit profile (if available)
- View saved items (if available)
- Logout button clears session

### 7.6 Seller Features
- Click "Become Seller"
- Verify role change
- Visit Seller Dashboard
- Can see option to create product

---

## 8. Test Results Template

```
API Integration Test Results
Date: ____________
Tester: ______________
Environment: ____________

Foods Endpoints:
  [ ] List Foods - PASS/FAIL
  [ ] Search by Query - PASS/FAIL
  [ ] Filter by Country - PASS/FAIL
  [ ] Filter by Category - PASS/FAIL
  [ ] Pagination - PASS/FAIL
  [ ] Get Trending - PASS/FAIL
  [ ] Get by ID - PASS/FAIL
  [ ] Get Invalid ID - PASS/FAIL
  [ ] Create (with auth) - PASS/FAIL
  [ ] Create (without auth) - PASS/FAIL
  [ ] Update - PASS/FAIL
  [ ] Delete - PASS/FAIL

User Endpoints:
  [ ] Get Profile by ID - PASS/FAIL
  [ ] Get Current User - PASS/FAIL
  [ ] Get All Users - PASS/FAIL
  [ ] Get Top Sellers - PASS/FAIL
  [ ] Become Seller - PASS/FAIL
  [ ] Non-existent User - PASS/FAIL

Order Endpoints:
  [ ] Create Order - PASS/FAIL
  [ ] List Orders - PASS/FAIL
  [ ] Get by ID - PASS/FAIL
  [ ] Update Status - PASS/FAIL
  [ ] Cancel Order - PASS/FAIL
  [ ] Cancel Non-Cancelable - PASS/FAIL

Error Handling:
  [ ] Missing Required Fields - PASS/FAIL
  [ ] Invalid JSON - PASS/FAIL
  [ ] Invalid Auth - PASS/FAIL
  [ ] Missing Auth - PASS/FAIL

Database:
  [ ] Users Table - PASS/FAIL
  [ ] Foods Table - PASS/FAIL
  [ ] Orders Table - PASS/FAIL
  [ ] Relationships - PASS/FAIL
  [ ] Indexes - PASS/FAIL

Performance:
  [ ] Search < 500ms - PASS/FAIL
  [ ] Pagination < 1s - PASS/FAIL
  [ ] List All < 2s - PASS/FAIL
  [ ] Top Sellers < 500ms - PASS/FAIL

Browser:
  [ ] Landing Page - PASS/FAIL
  [ ] Search - PASS/FAIL
  [ ] Product Detail - PASS/FAIL
  [ ] Authentication - PASS/FAIL
  [ ] Dashboard - PASS/FAIL
  [ ] Seller Features - PASS/FAIL

Overall: PASS/FAIL
Notes:
_________________________________________________________________
```

---

## Quick Test Script

```bash
#!/bin/bash
# Run all basic tests

echo "=== Food Endpoints ==="
curl -s http://localhost:3001/api/foods | jq '.data | length'
curl -s "http://localhost:3001/api/foods?query=chocolate" | jq '.data | length'
curl -s http://localhost:3001/api/foods/trending | jq '.data | length'

echo ""
echo "=== User Endpoints ==="
curl -s http://localhost:3001/api/users | jq '.data | length'
curl -s http://localhost:3001/api/users/sellers/top | jq '.data | length'

echo ""
echo "=== Database Check ==="
docker-compose exec -T postgres psql -U postgres -d eushop -c "
  SELECT 
    (SELECT count(*) FROM users) as users,
    (SELECT count(*) FROM foods) as foods,
    (SELECT count(*) FROM orders) as orders;"

echo ""
echo "✅ All tests completed!"
```

---

## Running All Tests

```bash
# 1. Start system
./demo-setup.sh

# 2. Run API tests (use curl commands above)
bash test-api.sh

# 3. Run database checks
bash test-database.sh

# 4. Test in browser
open http://localhost:3000  # Mac
xdg-open http://localhost:3000  # Linux
start http://localhost:3000  # Windows

# 5. Check results
echo "All tests completed. Review results above."
```

---

**Version**: 1.0  
**Status**: Ready for Testing  
**Coverage**: 20+ API endpoints, 5+ error scenarios, performance benchmarks, browser validation
