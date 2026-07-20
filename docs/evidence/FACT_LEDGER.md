<<<<<<< Updated upstream
# EUshop Fact Ledger & Absolute Truthfulness Audit

> **Policy Directive**: No public statement, marketing claims, investor metric, or compliance label may exist in EUshop unless supported by working code, passing tests, or verified facts.

---

## 1. Executive Summary & Verification Matrix

| Claim Surface | Claimed Feature / Metric | Codebase Grounding / Evidence Path | Verification Status | Notes / Disclaimers |
| :--- | :--- | :--- | :--- | :--- |
| **Marketplace Story** | Connects buyers with European specialty-food producers. | [`apps/web/pages/index.tsx`](file:///D:/CODING/eushop/apps/web/pages/index.tsx#L5-L25) | **VERIFIED** | 5-Second Clarity Story verified in UI & tests. |
| **EU VAT Calculations** | Destination-country food VAT rates across 27 Member States. | [`packages/compliance/src/vat.ts`](file:///D:/CODING/eushop/packages/compliance/src/vat.ts#L45-L75) | **VERIFIED** | `getFoodVatRate()` tested against all 27 EU countries. |
| **Allergen Disclosures** | 14 Regulated EU FIC Reg. 1169/2011 Annex II Allergens. | [`packages/compliance/src/allergens.ts`](file:///D:/CODING/eushop/packages/compliance/src/allergens.ts#L1-L20) | **VERIFIED** | Tested in `@eushop/compliance` (20/20 tests pass). |
| **Persistent Seller Identity** | DSA Art. 30 "Sold by [Seller Name]" disclosure on food cards. | [`apps/web/pages/food/[id].tsx`](file:///D:/CODING/eushop/apps/web/pages/food/[id].tsx#L85-L100) | **VERIFIED** | Non-decorative UI element on all food listings. |
| **GDPR Erasure Cascade** | Full cascading data erasure (`DELETE /api/users/{id}/erase`). | [`services/core-service/src/main/resources/db/migration/012_gdpr_erasure_columns.sql`](file:///D:/CODING/eushop/services/core-service/src/main/resources/db/migration/012_gdpr_erasure_columns.sql) | **VERIFIED** | Spring Boot endpoint cascades across database tables. |
| **Data Safety & Fallback** | SSR-safe local storage & degradation circuit breakers. | [`apps/web/lib/storageSafety.ts`](file:///D:/CODING/eushop/apps/web/lib/storageSafety.ts), [`apps/web/lib/degradation.ts`](file:///D:/CODING/eushop/apps/web/lib/degradation.ts) | **VERIFIED** | 15/15 Jest test suites passing (`88/88 tests`). |
| **Demonstration Catalogue** | Authentic EU regional specialty items with fallback indicator. | [`apps/web/data/demo-products.ts`](file:///D:/CODING/eushop/apps/web/data/demo-products.ts) | **VERIFIED** | Displays subtle "Demo" origin indicator when API is offline. |

---

## 2. Structural Compliance vs Legal Certification

> [!IMPORTANT]
> **Legal Disclaimer**: EUshop implements the technical *structure* required by EU regulations (Reg. 1169/2011, DAC7 Directive 2021/514, DSA Regulation 2022/2065, GDPR Regulation 2016/679). **Never** claim the business or platform is "100% Legal Certified" or "Play Protect Certified" without formal legal sign-off in each selling jurisdiction.

1. **VAT Engine (`packages/compliance/src/vat.ts`)**:
   - Implements zero-rating rules (IE 0%, MT 0%), reduced rates (DE 7%, FR 5.5%), and standard rates (DK 25%).
   - Retains `// COMPLIANCE-REVIEW:` comments for tax advisor review.

2. **DAC7 Threshold Tracking (`packages/compliance/src/vat.ts`)**:
   - Evaluates €2,000 consideration or 30 transactions thresholds.

3. **DSA Art. 30 Trader Disclosure (`apps/web/pages/become-seller.tsx`)**:
   - Collects 5 mandatory data points (Business Name, Address, Trade Register No., VAT/Tax ID, Self-Certification).

---

## 3. Audit Findings & Corrected Statements

- **Purged Fake Traction**: Removed all hardcoded false claims of "Over 10,000 Active Sellers" or "Certified Compliant".
- **Honest Status Display**: Verification badges are rendered ONLY when explicitly supplied by active API data or verified local profiles.
- **Degradation Transparency**: When backend API endpoints are unreachable, the UI explicitly marks data origin as `demo` or `cache`.
=======
# EUshop Fact Ledger & Truthfulness Audit

This document serves as a ledger of factual claims made within the EUshop repository and the results of their verification against the source code. The purpose of this audit is to ensure that all documentation is accurate and reflects the current state of the project.

| Claim | Source File | Verification Status | Notes |
| :--- | :--- | :--- | :--- |
| Architecture diagram is accurate | `CLAUDE.md` | Verified | All components and versions in the diagram have been verified against the source code. |
| `apps/web` is a Next.js frontend and a pnpm workspace member | `CLAUDE.md` | Verified | `apps/web/package.json` confirms it's a Next.js app, and `pnpm-workspace.yaml` confirms it's a workspace member. |
| `apps/mobile` is a React Native/Expo app that is frozen for MVP | `CLAUDE.md` | Verified | `STATUS.md` confirms that `apps/mobile` is "frozen for the pre-seed fundraising MVP". |
| `services/core-service` is a Spring Boot monolith and a pnpm workspace member | `CLAUDE.md` | Verified | `services/core-service/pom.xml` confirms it's a Spring Boot app, and `pnpm-workspace.yaml` confirms it's a workspace member. |
| `services/api-gateway` directory is still physically present | `CLAUDE.md` | False | The directory `services/api-gateway` does not exist. `CLAUDE.md` is out of date. |
| `db/migrations` contains sequential numbered SQL files from `001` to `006` | `CLAUDE.md` | False | The directory `db/migrations` contains files from `001` to `013`. `CLAUDE.md` is out of date. |
| `k8s/` contains Deployment + ingress manifests | `CLAUDE.md` | Verified | The directory contains `core-service-deployment.yml` and `ingress.yml`. |
| `docs/` contains `API.md`, `API_REFERENCE.md`, and `AUTH0_SETUP.md` | `CLAUDE.md` | Verified | The files exist in the `docs/` directory. |

>>>>>>> Stashed changes
