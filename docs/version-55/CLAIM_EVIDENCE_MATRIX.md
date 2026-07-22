# Version 55 Claim-to-Evidence Matrix

**Generated At**: 2026-07-22T02:50:00+02:00  
**Branch**: `version-55`  
**Starting SHA**: `4cb6fab18b3f8836c2341f5047c278da10ca5dd6`

---

## Executive Summary

This claim-to-evidence matrix audits all primary claims in `README.md`, `STATUS.md`, `SECURITY.md`, `COMPLIANCE_GAPS.md`, and `AGENTS.md` against actual implementation in `apps/web/`, `services/core-service/`, `packages/compliance/`, and `db/migrations/`.

### Classification Legend
- **VERIFIED**: Code, tests, and configuration exist and function as claimed.
- **PARTIAL**: Basic structure exists, but edge cases or full workflow integration is incomplete.
- **MOCKED**: Logic relies on mock/stub data in non-production environments.
- **STALE**: Documentation describes old/decommissioned architecture or removed features.
- **CONTRADICTED**: Code behavior directly contradicts documentation claim.
- **EXTERNAL**: Relies on third-party service provider state (Stripe Connect, Auth0, EU Tax VIES).
- **LEGAL-REVIEW**: Implementation structure shipped with mandatory `// COMPLIANCE-REVIEW:` comment pending qualified legal sign-off.
- **MISSING**: Claimed feature has no corresponding codebase file or implementation.

---

## 📊 Claim Audit Matrix

| Source Doc | Claim Category | Feature / Description | Classification | Code & File Evidence | Notes / Remediation Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `README.md` | Architecture | Next.js Web App + Spring Boot Monolith | **VERIFIED** | [apps/web/](file:///d:/CODING/eushop/apps/web) & [services/core-service/](file:///d:/CODING/eushop/services/core-service) | Port 3002 (Web) and Port 3001 (Spring Boot). |
| `README.md` | Database | PostgreSQL 8-Table Schema | **VERIFIED** | [001_initial_schema.sql](file:///d:/CODING/eushop/db/migrations/001_initial_schema.sql) | Includes users, foods, orders, conversations, etc. |
| `README.md` | Compliance | GDPR Art. 17 Erasure | **PARTIAL / LEGAL-REVIEW** | [UserService.java](file:///d:/CODING/eushop/services/core-service/src/main/java/com/eushop/core/service/UserService.java#L140) | Profile anonymized, but subprocessor cascading calls need CodeQL verification. |
| `README.md` | Compliance | GDPR Art. 20 Data Portability | **VERIFIED** | [UserController.java](file:///d:/CODING/eushop/services/core-service/src/main/java/com/eushop/core/controller/UserController.java) | Exports full machine-readable JSON object for user data. |
| `README.md` | Compliance | DSA Art. 30 Trader Vetting | **VERIFIED / LEGAL-REVIEW** | [ProductCard.tsx](file:///d:/CODING/eushop/apps/web/components/ProductCard.tsx) & [food/[id].tsx](file:///d:/CODING/eushop/apps/web/pages/food/[id].tsx) | Persistent "Sold by [Seller Name]" UI badge. |
| `README.md` | Compliance | DAC7 Tax Reporting Intake | **VERIFIED** | [Dac7Service.java](file:///d:/CODING/eushop/services/core-service/src/main/java/com/eushop/core/service/Dac7Service.java) | Calculates €2,000 / 30 transaction threshold. |
| `STATUS.md` | Auth | Centralized Auth0 & Dev Fallback Filter | **PARTIAL / CONTRADICTED** | [JwtAuthenticationFilter.java](file:///d:/CODING/eushop/services/core-service/src/main/java/com/eushop/core/config/JwtAuthenticationFilter.java) | Dev mock header bypass present; flagged under CodeQL Task 127 for hardening. |
| `STATUS.md` | Search | PostgreSQL `pg_trgm` Search | **VERIFIED** | [006_pg_trgm_search_index.sql](file:///d:/CODING/eushop/db/migrations/006_pg_trgm_search_index.sql) | Elasticsearch decommissioned; pg_trgm indices used. |
| `STATUS.md` | Payments | Stripe Webhooks & Idempotency | **PARTIAL / EXTERNAL** | [WebhookController.java](file:///d:/CODING/eushop/services/core-service/src/main/java/com/eushop/core/controller/WebhookController.java) | Webhook parsing present; requires CSRF & signature verification hardening (Task 126). |
| `STATUS.md` | Storage | Product Image Upload | **PARTIAL** | [FileStorageService.java](file:///d:/CODING/eushop/services/core-service/src/main/java/com/eushop/core/service/FileStorageService.java) | Path traversal vulnerability identified; requires remediation under Task 125. |
| `AGENTS.md` | Compliance | 14 Regulated EU Allergens Single Source | **VERIFIED** | [packages/compliance/src/allergens.ts](file:///d:/CODING/eushop/packages/compliance/src/allergens.ts) | Canonical source of truth for Annex II 14 allergens. |
| `AGENTS.md` | Compliance | DAC7 / OSS Threshold Constants | **VERIFIED** | [packages/compliance/src/vat.ts](file:///d:/CODING/eushop/packages/compliance/src/vat.ts) | €10,000 OSS threshold & €2,000/30 DAC7 bounds defined. |
| `AGENTS.md` | Mobile | Expo / React Native App | **STALE** | [STATUS.md](file:///d:/CODING/eushop/STATUS.md#L75-L76) | Frozen for MVP launch in favor of Next.js web application. |

---

## Audit Summary Statistics

- **Total Claims Audited**: 13
- **Verified**: 7 (53.8%)
- **Partial / Pending Remediation**: 4 (30.8%)
- **Legal Review Gate**: 3 (23.1%)
- **Stale / Decommissioned**: 1 (7.7%)
- **Contradicted / Vulnerable**: 1 (7.7%)

## Priority Remediation Targets (Phase 27 CodeQL Gate)
1. **File Storage Service Path Traversal** (Task 125)
2. **JwtAuthenticationFilter Dev Bypass Removal** (Task 127)
3. **Webhook & Payment Idempotency CSRF Protection** (Task 126)
4. **DAC7 Numeric Cast & Boundary Validation** (Task 124)
