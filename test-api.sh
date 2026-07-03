#!/bin/bash
# Automated API Test Suite
# Tests all major endpoints and validates responses

set -e

API_URL="http://localhost:3001/api" # Unified to Spring Boot Core Service
TOKEN="eyJzdWIiOiJ1c2VyLTEyMyIsImVtYWlsIjoic2VsbGVyMUBleGFtcGxlLmNvbSIsImV4cCI6OTk5OTk5OTk5OX0="
PASS=0
FAIL=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function to test endpoint
test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local expected_code="$4"
    local data="$5"
    
    echo -n "Testing: $name... "
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "$expected_code" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        ((PASS++))
    else
        echo -e "${RED}✗ FAIL${NC} (Expected $expected_code, got $http_code)"
        ((FAIL++))
        echo "Response: $body"
    fi
}

# Helper function to test endpoint without auth
test_endpoint_noauth() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local expected_code="$4"
    
    echo -n "Testing: $name... "
    
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "$expected_code" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        ((PASS++))
    else
        echo -e "${RED}✗ FAIL${NC} (Expected $expected_code, got $http_code)"
        ((FAIL++))
    fi
}

echo "=================================================="
echo "EU Specialty Food Marketplace - API Test Suite"
echo "=================================================="
echo ""

# Check if API is running
echo "Checking API connectivity..."
if ! curl -s "$API_URL/foods" > /dev/null 2>&1; then
    echo -e "${RED}✗ API is not responding on $API_URL${NC}"
    echo "Make sure you've run: cd services/core-service && mvn spring-boot:run"
    exit 1
fi
echo -e "${GREEN}✓ API is responding${NC}"
echo ""

# ===== FOOD ENDPOINTS =====
echo -e "${YELLOW}=== FOOD ENDPOINTS ===${NC}"
test_endpoint_noauth "List Foods (GET /foods)" "GET" "/foods" "200"
test_endpoint_noauth "Search Foods by Query (GET /foods?query=chocolate)" "GET" "/foods?query=chocolate" "200"
test_endpoint_noauth "Filter by Country (GET /foods?country=BE)" "GET" "/foods?country=BE" "200"
test_endpoint_noauth "Get Trending Foods (GET /foods/trending?country=BE)" "GET" "/foods/trending?country=BE" "200"
test_endpoint_noauth "Get Food by ID (GET /foods/1)" "GET" "/foods/1" "200"
test_endpoint_noauth "Get Invalid Food (GET /foods/99999)" "GET" "/foods/99999" "404"
echo ""

# ===== USER ENDPOINTS =====
echo -e "${YELLOW}=== USER ENDPOINTS ===${NC}"
test_endpoint_noauth "Get User Profile (GET /users/1)" "GET" "/users/1" "200"
test_endpoint_noauth "Get All Users (GET /users)" "GET" "/users" "200"
test_endpoint_noauth "Get Top Sellers (GET /users/sellers/top)" "GET" "/users/sellers/top" "200"
test_endpoint_noauth "Get Invalid User (GET /users/99999)" "GET" "/users/99999" "404"
echo ""

# ===== AUTHENTICATED REQUESTS =====
echo -e "${YELLOW}=== AUTHENTICATED REQUESTS ===${NC}"
test_endpoint "Create Food (POST /foods)" "POST" "/foods" "201" \
    '{"name":"Test Food","description":"Test","price":10.99,"country":"BE","category":"test","quantity":100, "allergens": "[]"}' # Added allergens
test_endpoint "Get Current User (GET /users)" "GET" "/users" "200"
echo ""

# ===== ERROR HANDLING =====
echo -e "${YELLOW}=== ERROR HANDLING ===${NC}"
test_endpoint_noauth "Missing Auth Header (POST /foods)" "POST" "/foods" "401"
test_endpoint_noauth "Invalid Endpoint (GET /invalid)" "GET" "/invalid" "404"
echo ""

# ===== DATABASE VERIFICATION =====
echo -e "${YELLOW}=== DATABASE VERIFICATION ===${NC}"

echo -n "Checking Users in Database... "
user_count=$(docker-compose exec -T postgres psql -U postgres -d eushop -tc "SELECT count(*) FROM users;")
if [ "$user_count" -ge 3 ]; then
    echo -e "${GREEN}✓ PASS${NC} ($user_count users)"
    ((PASS++))
else
    echo -e "${RED}✗ FAIL${NC} (Expected 3+, got $user_count)"
    ((FAIL++))
fi

echo -n "Checking Foods in Database... "
food_count=$(docker-compose exec -T postgres psql -U postgres -d eushop -tc "SELECT count(*) FROM foods;")
if [ "$food_count" -ge 3 ]; then
    echo -e "${GREEN}✓ PASS${NC} ($food_count foods)"
    ((PASS++))
else
    echo -e "${RED}✗ FAIL${NC} (Expected 3+, got $food_count)"
    ((FAIL++))
fi

echo -n "Checking Food-User Relationships... "
relationship_count=$(docker-compose exec -T postgres psql -U postgres -d eushop -tc "
    SELECT count(*) FROM foods f JOIN users u ON f.seller_id = u.id;")
if [ "$relationship_count" -ge 3 ]; then
    echo -e "${GREEN}✓ PASS${NC} ($relationship_count valid relationships)"
    ((PASS++))
else
    echo -e "${RED}✗ FAIL${NC} (Expected 3+, got $relationship_count)"
    ((FAIL++))
fi
echo ""

# ===== PERFORMANCE TESTS =====
echo -e "${YELLOW}=== PERFORMANCE TESTS ===${NC}"

echo -n "Search Performance (should be < 500ms)... "
start_time=$(date +%s%N)
curl -s "$API_URL/foods?query=chocolate" > /dev/null
end_time=$(date +%s%N)
duration=$((($end_time - $start_time) / 1000000))
if [ "$duration" -lt 500 ]; then
    echo -e "${GREEN}✓ PASS${NC} (${duration}ms)"
    ((PASS++))
else
    echo -e "${YELLOW}⚠ WARNING${NC} (${duration}ms, expected < 500ms)"
fi

echo -n "List Foods Performance (should be < 1000ms)... "
start_time=$(date +%s%N)
curl -s "$API_URL/foods?page=0&size=100" > /dev/null
end_time=$(date +%s%N)
duration=$((($end_time - $start_time) / 1000000))
if [ "$duration" -lt 1000 ]; then
    echo -e "${GREEN}✓ PASS${NC} (${duration}ms)"
    ((PASS++))
else
    echo -e "${YELLOW}⚠ WARNING${NC} (${duration}ms, expected < 1000ms)"
fi

echo -n "Top Sellers Performance (should be < 500ms)... "
start_time=$(date +%s%N)
curl -s "$API_URL/users/sellers/top" > /dev/null
end_time=$(date +%s%N)
duration=$((($end_time - $start_time) / 1000000))
if [ "$duration" -lt 500 ]; then
    echo -e "${GREEN}✓ PASS${NC} (${duration}ms)"
    ((PASS++))
else
    echo -e "${YELLOW}⚠ WARNING${NC} (${duration}ms, expected < 500ms)"
fi
echo ""

# ===== SERVICE HEALTH =====
echo -e "${YELLOW}=== SERVICE HEALTH ===${NC}"

echo -n "PostgreSQL... "
if docker-compose exec -T postgres psql -U postgres -d eushop -tc "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Running${NC}"
    ((PASS++))
else
    echo -e "${RED}✗ Not responding${NC}"
    ((FAIL++))
fi

echo -n "Redis... "
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Running${NC}"
    ((PASS++))
else
    echo -e "${RED}✗ Not responding${NC}"
    ((FAIL++))
fi

echo -n "Spring Boot Service... "
if curl -s "$API_URL/foods" > /dev/null 2>&1; then # Check Spring Boot directly
    echo -e "${GREEN}✓ Running${NC}"
    ((PASS++))
else
    echo -e "${RED}✗ Not responding${NC}"
    ((FAIL++))
fi

echo -n "Frontend... "
if curl -s "http://localhost:3000" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Running${NC}"
    ((PASS++))
else
    echo -e "${RED}✗ Not responding${NC}"
    ((FAIL++))
fi

echo ""
echo "=================================================="
echo "Test Results"
echo "=================================================="
echo -e "Passed: ${GREEN}$PASS${NC}"
echo -e "Failed: ${RED}$FAIL${NC}"
echo "Total: $((PASS + FAIL))"

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please review.${NC}"
    exit 1
fi
