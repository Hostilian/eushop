# EUshop AI Repository Navigation, Trap Register & Architectural Field Guide

> **Target Audience**: Autonomous AI Agents, Orchestrator Failover Nodes, and Senior Maintainers.  
> **Repository Root**: `D:\CODING\eushop`  
> **Canonical Operating Rules**: Refer to [`AGENTS.md`](file:///D:/CODING/eushop/AGENTS.md) for non-negotiable compliance rules.

---

## 1. Monorepo Map & Architecture Directory Overview

```
eushop/
├── AGENTS.md                            → Absolute priority operating rules & legal guidelines
├── AI_REPOSITORY_NAVIGATION.md           → This document: Comprehensive field guide & trap register
├── CHANGELOG.md                         → Session changelog (MUST be updated every code change)
├── apps/
│   ├── web/                             → Next.js 14 Pages Router (Static export under `/eushop/`)
│   │   ├── pages/                       → Routing pages (`index.tsx`, `become-seller.tsx`, `checkout.tsx`, etc.)
│   │   ├── components/                  → UI components (`common/ErrorBoundary.tsx`, `marketplace/AllergenFilter.tsx`)
│   │   ├── lib/                         → Core utilities (`degradation.ts`, `storageSafety.ts`, `services.ts`)
│   │   └── data/                        → Bundled demo data (`demo-products.ts`)
│   └── mobile/                          → Expo 50 / React Native mobile client
│       ├── App.tsx                      → Entry point
│       └── screens/                     → Screens (`HomeScreen.tsx`, `ProfileScreen.tsx`, `CheckoutScreen.tsx`)
├── packages/
│   ├── compliance/                      → SINGLE SOURCE OF TRUTH for VAT, DAC7 & 14 EU Allergens
│   │   ├── src/allergens.ts             → 14 Annex II Regulated EU Allergens list
│   │   └── src/vat.ts                   → 27 Member State food VAT rates & DAC7 thresholds
│   └── types/                           → Shared Zod TypeScript schemas (`Product`, `Seller`, `Order`)
├── services/
│   └── core-service/                    → Spring Boot modular monolith backend (Port 3001)
│       └── src/main/resources/          → Application configuration & migration resources
├── db/
│   ├── migrations/                      → PostgreSQL migration scripts (`001_*.sql` to `013_*.sql`)
│   └── seed/                            → Initial database seed data (`001_*.sql`, `002_*.sql`)
├── docs/                                → Evidence, audit, security & investor documentation
│   ├── evidence/FACT_LEDGER.md          → Truthfulness audit ledger
│   ├── agent/                           → Asset provenance, legal review, security review
│   ├── architecture/                    → System topology & navigation field guide
│   └── version-44/                      → YC pitch suite, demo script, master gap analysis
└── scripts/                             → Failover orchestrator, self-healing watchdog & status tools
    ├── EUshop-Agent-Orchestrator.ps1    → Autonomous 20-provider failover loop
    ├── EUshop-Agent-Watchdog.ps1        → Self-healing daemon (PID 908)
    └── Get-Progress.ps1                 → Real-time progress dashboard tool
```

---

## 2. Execution Paths & Ports Reference

| Subsystem | Port / Target | Config File | Notes / Rules |
| :--- | :--- | :--- | :--- |
| **Web App (Dev)** | `http://localhost:3000` | `apps/web/package.json` | Next.js dev server (`pnpm --filter "@eushop/web" dev`). |
| **Web App (GitHub Pages)** | `https://hostilian.github.io/eushop/` | `apps/web/next.config.js` | BasePath set to `/eushop`. Always use dynamic base path helpers. |
| **Core Backend Service** | `http://localhost:3001` | `services/core-service/src/main/resources/application.yml` | Spring Boot monolith port. |
| **Local Failover FCC API** | `http://127.0.0.1:8082` | `scripts/EUshop-Agent-Orchestrator.ps1` | Primary free local AI wrapper endpoint. |

---

## 3. Discovered Code Traps, Historical Artifacts & Remediation Log

| Item / Hazard | Location / Symptom | Status / Remediation |
| :--- | :--- | :--- |
| **Web `tsconfig.json` Include Typo** | `"include": ["**/*.ts", "**/*.tx"]` caused TS compiler to skip `.tsx` page components. | **FIXED** (`2b15c705`): Updated `"**/*.tx"` to `"**/*.tsx"`. |
| **Mobile JSX Closing Tag Mismatch** | `apps/mobile/screens/ProfileScreen.tsx` L58 opened `<SafeAreaView>` but closed with `</View>` on L89. | **FIXED** (`2b15c705`): Changed L89 to `</SafeAreaView>`. |
| **Duplicate Migration File Prefix** | Two scripts were named `009_android_device_tokens.sql` and `009_chat_enhancements.sql`. | **FIXED** (`2b15c705`): Renamed to `009b_chat_enhancements.sql`. |
| **Hand-Copied Allergen Lists** | Legacy UI components hand-copied modified allergen strings instead of importing `packages/compliance`. | **FIXED**: All components now import `EU_ALLERGENS_14` from `packages/compliance/src/allergens.ts`. |
| **Base Path Asset Resolution** | Hardcoded root URLs (`/images/...`) break when deployed to GitHub Pages subpath `/eushop/`. | **RULE**: Prefix static asset links with `process.env.NEXT_PUBLIC_BASE_PATH` or `/eushop/`. |
| **DB Enum Case Sensitivity** | Seed SQL files used lowercase `'buyer'`/`'seller'` while Spring Boot enums expect `BUYER`/`SELLER`. | **RULE**: Maintain uppercase enum strings in database SQL payloads. |
| **Historical Directory Artifacts** | Downloaded reference trees in `.claude/codex-api-home/.tmp/` or temporary build caches. | **RULE**: Do not edit temporary reference trees; keep edits strictly within `apps/`, `packages/`, `services/`, `db/`, `docs/`, `scripts/`. |

---

## 4. Single Source of Regulatory Truth Protocol

> [!CAUTION]
> **NEVER** hand-copy or duplicate VAT rates, allergen arrays, or DAC7 thresholds into `apps/web` or `services/core-service`.

- **14 Regulated EU Allergens (FIC Reg. 1169/2011 Annex II)**:
  - Source file: [`packages/compliance/src/allergens.ts`](file:///D:/CODING/eushop/packages/compliance/src/allergens.ts)
- **EU Food VAT Rates (27 Member States)**:
  - Source file: [`packages/compliance/src/vat.ts`](file:///D:/CODING/eushop/packages/compliance/src/vat.ts)
- **DAC7 Reporting Thresholds Directive 2021/514**:
  - Source file: [`packages/compliance/src/vat.ts`](file:///D:/CODING/eushop/packages/compliance/src/vat.ts) (`DAC7_THRESHOLDS` = €2,000 / 30 sales)

---

## 5. Required Verification Commands for AI Agents

Before declaring any task complete or committing code, AI agents MUST execute and verify:

```bash
# 1. Web TypeScript Type Check
pnpm --filter "@eushop/web" exec tsc --noEmit

# 2. Web Jest Unit & Integration Test Suite (15 Test Suites, 88 Tests)
pnpm --filter "@eushop/web" test

# 3. Compliance Package Validation (20 Tests)
pnpm --filter "@eushop/compliance" test

# 4. Core Backend Service Tests (Spring Boot Maven)
./mvnw test -f services/core-service/pom.xml
```

---

## 6. Master Version 44 Queue Status (24/24 Tasks Completed)

| Task | Category | Description | Status |
| :--- | :--- | :--- | :--- |
| **Task 1** | CI/CD | Fix & consolidate CI/CD workflows (`.github/workflows/ci-cd.yml`) | **MERGED TO MAIN** |
| **Task 2** | Auth | Remove mock localStorage auth tokens | **MERGED TO MAIN** |
| **Task 3** | Auth | Enforce fail-closed Auth0 session secret | **MERGED TO MAIN** |
| **Task 4** | VAT | Wire VAT calculation engine to checkout page | **MERGED TO MAIN** |
| **Task 5** | GDPR | Add GDPR Art. 17 cascading erasure endpoint & DB migration 012 | **MERGED TO MAIN** |
| **Task 6** | Testing | Expand unit/integration test coverage & DB migration 013 | **MERGED TO MAIN** |
| **Task 7** | DSA | DSA Art. 30 "Sold by [Seller]" persistent disclosure on food cards | **MERGED TO MAIN** |
| **Task 8** | Resilience | Centralized Reliability & Degradation Engine (`degradation.ts`) | **MERGED TO MAIN** |
| **Task 9** | UI | React Error Boundaries around key user experience regions | **MERGED TO MAIN** |
| **Task 10**| Data Safety | Local Data Safety & Storage Handler (`storageSafety.ts`) | **MERGED TO MAIN** |
| **Task 11**| Brand | Homepage Rebuild & 5-Second Clarity Story (`index.tsx`) | **MERGED TO MAIN** |
| **Task 12**| Demo Data | Bundled Demonstration Catalogue (`demo-products.ts`) | **MERGED TO MAIN** |
| **Task 13**| A11y | Resilient Image Fallbacks & WCAG 2.2 AA Contrast Polish | **MERGED TO MAIN** |
| **Task 14**| Seller | Complete Functional Seller Onboarding Journey (`become-seller.tsx`) | **MERGED TO MAIN** |
| **Task 15**| Marketplace | "Feat of Strength": Interactive EU 14-Allergen Filter Engine | **MERGED TO MAIN** |
| **Task 16**| Truthfulness | Fact Ledger & Absolute Truthfulness Audit (`FACT_LEDGER.md`) | **MERGED TO MAIN** |
| **Task 17**| Provenance | Asset Provenance & License Clearance (`ASSET_PROVENANCE.md`) | **MERGED TO MAIN** |
| **Task 18**| Legal | Legal & Regulatory Review Matrix (`LEGAL_REVIEW_REQUIRED.md`) | **MERGED TO MAIN** |
| **Task 19**| Security | Security & Privacy Hardening Suite (`SECURITY_REVIEW.md`) | **MERGED TO MAIN** |
| **Task 20**| Architecture| Monorepo Architecture Mapping (`CURRENT_ARCHITECTURE.md`) | **MERGED TO MAIN** |
| **Task 21**| Investor | Investor Readiness & YC Pitch Suite (`INVESTOR_READINESS.md`) | **MERGED TO MAIN** |
| **Task 22**| Pitch | Founder 2-Minute Demo Script (`DEMO_SCRIPT.md`) | **MERGED TO MAIN** |
| **Task 23**| Release Gate| Version 44 Release Gate Reliability Test & Deployment to `main` | **MERGED TO MAIN** |
| **Task 24**| Strategy | Repository Gap Analysis & Strategic Roadmap (`GAP_ANALYSIS_AND_FUTURE_ROADMAP.md`)| **MERGED TO MAIN** |
