# Workspace Quick Start Guide

Welcome to the EU Specialty Food Marketplace! This guide will get you up and running in minutes.

---

## 🎯 First Time Setup (5 minutes)

### Option 1: Automated Setup (Recommended)

**Windows:**
```cmd
demo-setup.bat
```

**Mac/Linux:**
```bash
./demo-setup.sh
```

This will:
- ✅ Check prerequisites
- ✅ Configure environment
- ✅ Install dependencies
- ✅ Start Docker services
- ✅ Run database migrations
- ✅ Seed test data
- ✅ Build Spring Boot service
- ✅ Show you the URLs to access

### Option 2: Manual Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Start infrastructure
docker-compose up -d

# 3. Setup database
pnpm db:migrate
pnpm db:seed

# 4. Start development
pnpm dev
```

---

## 🚀 Access Points

Once setup is complete, you can access:

| Service | URL | Purpose |
|---------|-----|---------|
| **Web App** | http://localhost:3000 | Main frontend |
| **API** | http://localhost:3001/api | REST endpoints |
| **Spring Boot** | http://localhost:8080/api | Core service |
| **pgAdmin** | http://localhost:5050 | Database UI |

---

## 👥 Demo Credentials

Use these to login and test:

**Buyer Account:**
- Email: `buyer1@example.com`
- Password: `password123`

**Seller Accounts:**
- Email: `seller1@example.com`
- Password: `password123`

(Or seller2, seller3, etc.)

---

## 📁 Project Structure

```
eushop/                          # Project root
├── apps/
│   ├── web/                      # Next.js frontend
│   │   ├── pages/                # React pages
│   │   ├── components/           # React components
│   │   └── lib/                  # Utilities & services
│   └── mobile/                   # React Native app
├── services/
│   ├── api-gateway/              # Express gateway
│   ├── core-service/             # Spring Boot backend
│   │   ├── src/main/java/com/eushop/core/
│   │   │   ├── controller/       # REST endpoints
│   │   │   ├── service/          # Business logic
│   │   │   ├── entity/           # Database models
│   │   │   ├── repository/       # Data access
│   │   │   └── dto/              # Response objects
│   │   └── pom.xml
│   └── messaging-service/        # Spring WebFlux
├── db/
│   ├── migrations/               # Database DDL
│   └── seed/                     # Test data
├── docker-compose.yml            # Infrastructure
├── pnpm-workspace.yaml           # Monorepo config
└── [Documentation Files]         # Guides & references
```

---

## 🛠️ Common Commands

### Development
```bash
pnpm dev              # Start all services

pnpm dev:web          # Frontend only (port 3000)
pnpm dev:api          # API Gateway only (port 3001)
pnpm dev:mobile       # Mobile app with Expo

pnpm build            # Build for production
```

### Database
```bash
pnpm db:migrate       # Run migrations
pnpm db:seed          # Load test data
pnpm db:reset         # Drop & recreate everything

# Or with Docker:
docker-compose exec postgres psql -U postgres -d eushop
```

### Docker
```bash
docker-compose up -d          # Start all services
docker-compose down           # Stop all services
docker-compose logs -f        # View logs in real-time
docker-compose ps             # Show running services
docker-compose exec <service> <command>  # Run command in service
```

### Testing
```bash
pnpm test             # Run all tests
pnpm test:web         # Frontend tests
pnpm test:api         # API tests
pnpm test:coverage    # With coverage report
```

---

## 📚 Documentation

Read these in order based on your role:

### For Everyone
1. **README.md** - Project overview (start here!)
2. **COMPLETION-SUMMARY.md** - What was built (Phase 2)

### For Demonstrations
1. **DEMO-GUIDE.md** - Step-by-step demo walkthrough
2. **DEMO-QUICK-REFERENCE.sh** - Commands during demo
3. **TECHNICAL-SUMMARY.md** - Explain to stakeholders

### For Developers
1. **DEVELOPMENT.md** - Dev environment setup
2. **PHASE-2-IMPLEMENTATION.md** - Architecture details
3. **API.md** - API endpoint reference

### For DevOps/Deployment
1. **DEPLOYMENT-CHECKLIST.md** - Production readiness
2. **docker-compose.yml** - Infrastructure config
3. **infrastructure/terraform** - IaC for cloud

---

## 🔍 Quick Verification

### Check everything is working:

```bash
# 1. Frontend loads
curl http://localhost:3000

# 2. API Gateway responds
curl http://localhost:3001/api/foods

# 3. Spring Boot running
curl http://localhost:8080/api/foods

# 4. Database connected
docker-compose exec postgres psql -U postgres -d eushop -c "SELECT * FROM users;"
```

Expected:
- ✅ All return 200 OK
- ✅ All return JSON data
- ✅ No errors in logs

---

## 🐛 Troubleshooting

### Port already in use?
```bash
# Find and kill process on port
lsof -i :3000    # Find what's on port 3000
kill -9 <PID>    # Kill the process
```

### Docker not responding?
```bash
# Restart Docker
docker restart

# Or restart specific service
docker-compose restart core-service
```

### Database connection error?
```bash
# Check if PostgreSQL is running
docker-compose logs postgres

# Verify database exists
docker-compose exec postgres psql -U postgres -l

# Recreate if needed
docker-compose exec postgres psql -U postgres -f /migrations/001_initial_schema.sql -d eushop
```

### Frontend not loading?
```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
pnpm dev

# Or in Windows:
rmdir /s node_modules .next
pnpm install
pnpm dev
```

### Spring Boot won't start?
```bash
# Check logs
docker-compose logs core-service

# Rebuild
docker-compose build core-service

# Restart
docker-compose restart core-service
```

---

## 📊 What to Explore

### Frontend
- Open http://localhost:3000
- Try searching for "chocolate"
- Click on a food item to see product details
- Sign up and login to see dashboard
- Click "Become Seller" to upgrade account

### Backend
- Visit http://localhost:3001/api/foods
- Browse different endpoints (see API.md for full list)
- Check Spring Boot console for queries being executed

### Database
- Open http://localhost:5050 (pgAdmin)
- Login with postgres/postgres
- Browse tables in "eushop" database
- Run SQL queries to see data

### Architecture
- Study the Spring Boot service layer (services/)
- Review the React components (web/pages/)
- Understand the data models (db/migrations/)
- Check API contracts (services/core-service/src/main/java/dto/)

---

## 🎓 Learning Paths

### I want to understand the architecture
1. Read TECHNICAL-SUMMARY.md
2. Review PHASE-2-IMPLEMENTATION.md
3. Study the Spring Boot entity models
4. Look at API.md to see contracts

### I want to add a new feature
1. Create database migration in db/migrations/
2. Add entity model in services/core-service/src/main/java/entity/
3. Add repository queries in services/core-service/src/main/java/repository/
4. Add service logic in services/core-service/src/main/java/service/
5. Add REST endpoint in services/core-service/src/main/java/controller/
6. Create DTO for request/response
7. Update frontend to call new endpoint
8. Add tests

### I want to deploy to production
1. Read DEPLOYMENT-CHECKLIST.md (complete checklist)
2. Configure .env.production with real credentials
3. Setup Auth0 (see AUTH0_SETUP.md)
4. Deploy with Docker or Kubernetes
5. Run database migrations on production
6. Monitor logs and errors

### I want to make the frontend look better
1. Review current design in TECHNICAL-SUMMARY.md
2. Look at Tailwind CSS utility classes used
3. Update components in apps/web/components/
4. Update pages in apps/web/pages/
5. Test on mobile (use DevTools responsive mode)
6. Submit for review

---

## 💡 Tips & Tricks

### Speed up development
```bash
# Use pnpm for faster installs
pnpm install  # Much faster than npm

# Run specific package
pnpm --filter api-gateway test

# Hot reload for faster feedback
pnpm dev     # Already has hot reload enabled
```

### Debug more easily
```bash
# Check real-time logs
docker-compose logs -f core-service

# Inspect database state
docker-compose exec postgres psql -U postgres -d eushop

# Test API endpoints
curl -H "Content-Type: application/json" \
  -d '{"query":"chocolate"}' \
  http://localhost:3001/api/foods

# Check network tab in browser DevTools
# F12 → Network tab → Filter by "foods"
```

### Work with Git
```bash
# See what changed
git status

# View recent commits
git log --oneline -5

# Create feature branch
git checkout -b feature/my-feature

# Commit changes
git add .
git commit -m "feat: description of change"

# Push to GitHub
git push origin feature/my-feature
```

---

## 🚀 Next Steps

1. **Run the setup script** (5 min)
   ```bash
   ./demo-setup.sh  # or demo-setup.bat on Windows
   ```

2. **Follow DEMO-GUIDE.md** (10 min)
   - See the system in action
   - Understand the user flows

3. **Explore the code** (30 min)
   - Read the Spring Boot services
   - Review the React components
   - Understand the database schema

4. **Make a change** (optional)
   - Add a button, change text
   - Add a new API endpoint
   - Modify the database

5. **Deploy** (when ready)
   - Follow DEPLOYMENT-CHECKLIST.md
   - Get real Auth0 credentials
   - Deploy to your platform

---

## 📞 Getting Help

- **Architecture questions** → Read TECHNICAL-SUMMARY.md
- **API questions** → Read API.md
- **Demo questions** → Follow DEMO-GUIDE.md
- **Setup problems** → Check this guide's Troubleshooting section
- **Deployment questions** → Read DEPLOYMENT-CHECKLIST.md
- **Code questions** → Check inline comments and docstrings

---

## ✅ You're Ready!

You now have everything you need to:
- ✅ Run the demo
- ✅ Understand the architecture
- ✅ Make code changes
- ✅ Deploy to production
- ✅ Extend with new features

**Go build something awesome!** 🚀

---

**Quick Start Version**: 1.0  
**Last Updated**: May 2026  
**Status**: ✅ Ready to Use

For detailed information, see the comprehensive documentation files in the project root.
