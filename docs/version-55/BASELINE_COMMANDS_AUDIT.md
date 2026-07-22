# Version 55 Baseline Commands Audit & Architecture Inventory

**Generated At**: 2026-07-22T02:52:00+02:00  
**Branch**: `version-55`  
**Starting SHA**: `4cb6fab18b3f8836c2341f5047c278da10ca5dd6`

---

## 🏗️ Architecture Inventory

1. **Frontend Web App (`apps/web`)**:
   - Framework: Next.js 15.5 (Pages Router)
   - Port: 3002
   - Key Pages: `cart.tsx`, `checkout.tsx`, `become-seller.tsx`, `privacy.tsx`, `food/[id].tsx`
2. **Backend Core Monolith (`services/core-service`)**:
   - Framework: Spring Boot 3.x (Java 17)
   - Port: 3001
   - Key Services: `Dac7Service`, `UserService`, `PaymentService`, `FileStorageService`, `ConversationService`
3. **Regulatory Compliance Library (`packages/compliance`)**:
   - Single source of truth for Annex II 14 allergens, VAT rates per EU member state, OSS threshold (€10,000), and DAC7 thresholds (€2,000 / 30 transactions).
4. **Shared Types (`packages/types`)**:
   - Zod/TS schemas for food items, seller registration, and orders.
5. **Database (`db/migrations`)**:
   - PostgreSQL 8-table relational schema (`001` through `006_pg_trgm_search_index.sql`).

---

## 📋 Baseline Command Results

| Domain | Command Executed | Exit Code | Result | Remediation Action Taken |
| :--- | :--- | :--- | :--- | :--- |
| **Hermes Preflight** | `powershell -File .\scripts\Test-HermesPreflight.ps1` | `0` (Warn 1) | **PASS** (23/24) | Untracked secrets verified; gateway status checked. |
| **Frontend Build** | `pnpm --filter @eushop/web build` | `0` | **PASS** (26/26 static routes) | Repaired `dac7-event-bus.ts`, `rbac.ts`, and `redis-cache.ts`. |
| **Backend Compile** | `./mvnw.cmd test-compile` | `0` | **PASS** | Repaired missing `Map` import in `ConversationService.java`. |
| **Secret Scan** | `git ls-files` check for keys | `0` | **PASS** | Verified `custom_keys.json` and `.env.local` remain strictly untracked. |
| **CodeQL Inventory** | CodeQL finding analysis | `0` | **INVENTORY** | 18 findings identified for Phase 27 P0 security gate. |

---

## 🔒 CodeQL Finding Baseline (Phase 27 Gate Targets)
- **18 Total Findings Identified**:
  - `DAC7` numeric precision & unchecked casts -> `Dac7Service.java`
  - `FileStorageService` path traversal -> `FileStorageService.java`
  - Auth bypass filter -> `JwtAuthenticationFilter.java`
  - Webhook CSRF & idempotency validation -> `WebhookController.java`
