# EUshop Developer Onboarding, Architecture & Environment Guide

**Monorepo Architecture:** Spring Boot Modular Monolith (Port 3001) + Next.js Frontend (Port 3000)  
**Database:** PostgreSQL 15+ with PostGIS spatial extension (Port 5432)  

---

## 1. Quick Start Commands

```bash
# 1. Start PostgreSQL DB & Services
docker-compose up -d

# 2. Run Backend Unit & Integration Tests (61/61 Pass)
cd services/core-service && ./mvnw test

# 3. Start Next.js Development Server
cd apps/web && npm run dev
```

---

## 2. Emergency Rollback Protocol

In the event of a database migration or deployment failure, execute:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/Emergency-Recovery.ps1
```
