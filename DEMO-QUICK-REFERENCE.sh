#!/bin/bash
# EU Specialty Food Marketplace - Demo Quick Reference
# Keep this open during demos for quick command reference

# ============================================
# QUICK START
# ============================================

# 1. First time setup (choose one):
./demo-setup.sh              # Linux/Mac automatic setup
demo-setup.bat               # Windows automatic setup

# OR manually:
pnpm install
docker-compose up -d
pnpm db:migrate && pnpm db:seed

# 2. Start development
pnpm dev                     # Starts all services

# 3. Access points
echo "Web: http://localhost:3000"
echo "API: http://localhost:3001/api"
echo "DB: postgresql://postgres:postgres@localhost:5432/eushop"

# ============================================
# DEMO CREDENTIALS (Pre-seeded in database)
# ============================================

# Buyer Account
Email: buyer1@example.com
Password: password123

# Seller Accounts
Email: seller1@example.com
Password: password123

Email: seller2@example.com
Password: password123

# Admin (future)
Email: admin@example.com
Password: password123

# ============================================
# COMMON TASKS
# ============================================

# Reset database to clean state
pnpm db:reset                # Drop and recreate with seed data

# View database
docker-compose exec postgres psql -U postgres -d eushop
# Then: \dt (show tables), SELECT * FROM users; etc.

# View API logs
docker-compose logs api-gateway -f

# View Spring Boot logs
docker-compose logs core-service -f

# View PostgreSQL logs
docker-compose logs postgres -f

# Stop all services
docker-compose down

# Remove all volumes (careful!)
docker-compose down -v

# ============================================
# API ENDPOINTS FOR TESTING
# ============================================

# Foods (with sample token)
TOKEN="eyJzdWIiOiJ1c2VyLTEyMyIsImVtYWlsIjoic2VsbGVyMUBleGFtcGxlLmNvbSIsImV4cCI6OTk5OTk5OTk5OX0="
curl http://localhost:3001/api/foods
curl http://localhost:3001/api/foods/trending
curl "http://localhost:3001/api/foods?query=chocolate"
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/users

# Test with POST
curl -X POST http://localhost:3001/api/foods \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test Food","price":10.99}'

# ============================================
# DEMO FLOW CHECKLIST
# ============================================

# Phase 1: Authentication (2 min)
# [ ] Visit http://localhost:3000
# [ ] Click Sign Up
# [ ] Create new account
# [ ] See Dashboard with profile

# Phase 2: Food Discovery (3 min)
# [ ] Click "Browse Foods" or Search
# [ ] Search for "Chocolate"
# [ ] Filter by country "BE"
# [ ] See paginated results

# Phase 3: Product Details (2 min)
# [ ] Click on food item
# [ ] See /food/[id] detail page
# [ ] View price, seller, ratings
# [ ] Select quantity
# [ ] Click "Add to Cart"

# Phase 4: Seller Experience (3 min)
# [ ] Click "Become Seller"
# [ ] Visit Seller Dashboard
# [ ] View your products
# [ ] Can edit/delete listings

# Phase 5: Technical Demo (5 min)
# [ ] Show database structure (8 tables)
# [ ] Show API responses (curl)
# [ ] Show Spring Boot console
# [ ] Explain architecture

# ============================================
# TROUBLESHOOTING QUICK FIXES
# ============================================

# Port 3000/3001 already in use
kill -9 $(lsof -t -i:3000)    # Kill process on 3000
kill -9 $(lsof -t -i:3001)    # Kill process on 3001

# Docker not responding
docker restart                 # Restart Docker daemon

# Database migrations not running
docker-compose exec postgres psql -U postgres -d eushop -f /migrations/001_initial_schema.sql

# Spring Boot won't start
docker-compose logs core-service
mvn clean package -DskipTests  # Force rebuild

# API Gateway error
docker-compose logs api-gateway
npm install                    # Reinstall dependencies

# ============================================
# PERFORMANCE MONITORING
# ============================================

# Monitor Docker resources
docker stats

# Monitor database connections
docker-compose exec postgres psql -U postgres -c "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"

# Monitor application logs
pnpm dev                       # See real-time logs

# ============================================
# USEFUL URLS
# ============================================

Homepage:          http://localhost:3000
Login:             http://localhost:3000/login
Signup:            http://localhost:3000/signup
Dashboard:         http://localhost:3000/dashboard
Search:            http://localhost:3000/search
Become Seller:     http://localhost:3000/become-seller
Seller Dashboard:  http://localhost:3000/seller/dashboard

API Docs:          http://localhost:3001/api-docs (when GraphQL added)
Health:            http://localhost:3001/health
Database:          http://localhost:5050 (pgAdmin)

# ============================================
# KEY FILES FOR DEMO
# ============================================

Documentation:
- README.md - Project overview
- DEMO-GUIDE.md - Full demo walkthrough
- TECHNICAL-SUMMARY.md - Architecture details
- API.md - API reference
- DEVELOPMENT.md - Dev setup guide

Frontend Code:
- apps/web/pages/index.tsx - Landing page
- apps/web/pages/search.tsx - Search page
- apps/web/pages/food/[id].tsx - Detail page
- apps/web/lib/services.ts - API service layer

Backend Code:
- services/core-service/src/main/java/com/eushop/core/controller/ - REST endpoints
- services/core-service/src/main/java/com/eushop/core/entity/ - Database models
- services/core-service/src/main/java/com/eushop/core/repository/ - Data access

# ============================================
# GIT COMMANDS
# ============================================

# Check status
git status

# View changes
git diff

# Commit changes
git add .
git commit -m "feat: description of changes"

# Push to main
git push origin main

# Create feature branch
git checkout -b feature/your-feature

# ============================================
# DOCUMENTATION QUICK LINKS
# ============================================

# View specific section
grep -n "## " DEVELOPMENT.md     # List all sections
grep -n "GET\|POST" API.md        # List all endpoints

# Search docs
grep -r "Spring Boot" docs/      # Find Spring Boot references
grep -r "authentication" *.md    # Find auth mentions

# ============================================
# NOTES FOR PRESENTER
# ============================================

Key Points to Highlight:
1. Full-stack microservices architecture
2. Real OAuth 2.0 with Auth0 support
3. Spring Boot REST API with controllers
4. 8 normalized database tables
5. Responsive React frontend
6. Docker containerization
7. Production-ready code quality

Time Estimate:
- Setup: 10 minutes
- Demo Flow: 15 minutes
- Q&A: 5-10 minutes
- Total: 30-40 minutes

Demo Environment:
- Windows/Mac/Linux support
- No special tools required
- One command setup
- Pre-seeded data included
- Mock auth for demo (no Auth0 needed)

Questions to Be Ready For:
1. How does authentication work? → Mock JWT (demo) or Auth0 (production)
2. Can products be created? → Yes, by sellers (POST /foods)
3. What about payments? → Stripe integration in Phase 3
4. Is this production ready? → Architecture is, features being added
5. How many users can it handle? → Scales horizontally with Kubernetes

# ============================================
# HELPFUL COMMANDS DURING DEMO
# ============================================

# Show file tree
tree -L 3 -I 'node_modules|.next|target'

# Count lines of code
find apps services -name "*.ts" -o -name "*.tsx" -o -name "*.java" | xargs wc -l

# Show git log
git log --oneline -10

# Show database size
docker-compose exec postgres psql -U postgres -c "SELECT pg_database.datname, pg_size_pretty(pg_database_size(pg_database.datname)) FROM pg_database ORDER BY pg_database_size(pg_database.datname) DESC;"

# Show active connections
docker-compose exec postgres psql -U postgres -c "SELECT pid, usename, application_name, query FROM pg_stat_activity WHERE query != 'autovacuum';"

# ============================================
# END OF QUICK REFERENCE
# ============================================
