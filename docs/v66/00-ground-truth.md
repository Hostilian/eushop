# EUshop v66 Ground Truth Inventory & Architectural Baseline

**Date:** 2026-07-22  
**Git Branch:** `main`  
**Repository:** `Hostilian/eushop`  

---

## 1. Verified Core Tech Stack

| Domain Layer | Technology & Version | Status & Location |
| :--- | :--- | :--- |
| **Frontend Web** | Next.js 14 (Pages Router), TypeScript, React 18, Tailwind CSS | `apps/web` (26 static routes pre-rendered) |
| **Backend Core** | Java 17, Spring Boot 3.2.3, Spring MVC, Spring Data JPA | `services/core-service` (Port 3001) |
| **Database** | PostgreSQL 16 + sequential Flyway/SQL migrations | `db/migrations` |
| **Compliance Single Source** | TypeScript Shared Package | `packages/compliance` (FIC 1169 allergens, VAT, DAC7) |
| **Shared Schemas** | Zod + TypeScript Shared Package | `packages/types` |
| **Mobile Application** | Expo / React Native | `apps/mobile` |

---

## 2. Active Application & Workspace Layout

```text
apps/
  web/                     → Next.js frontend application (Pages Router, static export for Pages)
  mobile/                  → Expo / React Native mobile app
packages/
  compliance/              → VAT calculation engine, DAC7 thresholds, Annex II allergens (SOURCE OF TRUTH)
  types/                   → Shared Zod/TS contracts & entity schemas
services/
  core-service/            → Spring Boot modular monolith (Port 3001)
db/                        → PostgreSQL database migrations & schema
scripts/                   → Autonomous orchestration, watchdog, multi-agent sidecars & emergency tools
```

---

## 3. Verified Security & Regulatory Gates

- **Zero Path Traversal**: `FileStorageService.java` enforces strict path normalization (`startsWith` root confinement).
- **Zero Numeric Overflow**: `Dac7Service.java` uses `BigDecimal` and strict scale/precision validation.
- **Fail-Closed Auth Filter**: `JwtAuthenticationFilter.java` fails closed when JWT authentication secret is missing in production.
- **DAC7 Tax Thresholds**: 30 transactions or €2,000 consideration (`packages/compliance/src/vat.ts`).
- **Allergen Regulations**: 14 Annex II mandatory allergens under EU Reg 1169/2011 (`packages/compliance/src/allergens.ts`).
- **Backend Test Verification**: 56/56 Spring Boot unit & integration tests passing cleanly (100% success rate).
