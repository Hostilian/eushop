# EUshop Legal & Regulatory Review Matrix

> **IMPORTANT**: This document lists every compliance code path containing `// COMPLIANCE-REVIEW:` annotations. **None** of these implementations constitute certified legal advice. Qualified legal counsel and tax advisors must review each item before commercial operation in any EU Member State.

---

## 1. Compliance Logic Matrix & Review Items

| Regulation / Directive | Technical Code File | Implementation Detail | Action Required for Human Legal Sign-Off |
| :--- | :--- | :--- | :--- |
| **EU Food VAT (Council Dir. 2006/112/EC)** | [`packages/compliance/src/vat.ts`](file:///D:/CODING/eushop/packages/compliance/src/vat.ts#L45-L75) | `getFoodVatRate()` maps 27 EU member states to food VAT rates (e.g. DE 7%, FR 5.5%, IE 0%). | Confirm reduced/zero food VAT eligibility for specific specialty categories per country. |
| **DAC7 Reporting (Directive 2021/514)** | [`packages/compliance/src/vat.ts`](file:///D:/CODING/eushop/packages/compliance/src/vat.ts#L10-L20) | `DAC7_THRESHOLDS` (30 transactions OR €2,000 consideration). | Verify local tax authority XML/JSON reporting schema and annual reporting deadlines. |
| **DSA Trader Disclosure (Art. 30 Reg. 2022/2065)** | [`apps/web/pages/become-seller.tsx`](file:///D:/CODING/eushop/apps/web/pages/become-seller.tsx#L120-L200) | Collects trade register, VAT ID, business address, and FBO registration status. | Confirm sufficiency of self-certification text and verification document checks. |
| **Food Allergen Labeling (Reg. 1169/2011)** | [`packages/compliance/src/allergens.ts`](file:///D:/CODING/eushop/packages/compliance/src/allergens.ts#L1-L25) | 14 Annex II regulated allergens list and safety filter engine. | Verify distance-selling (online) allergen font contrast and language translation rules. |
| **GDPR Right to Erasure (Art. 17 Reg. 2016/679)** | [`services/core-service/src/main/resources/db/migration/012_gdpr_erasure_columns.sql`](file:///D:/CODING/eushop/services/core-service/src/main/resources/db/migration/012_gdpr_erasure_columns.sql) | Cascades erasure across user profiles, orders, and messages. | Ensure tax invoice retention laws (e.g. German AO 10-year storage) override erasure for order financial audit trails. |

---

## 2. Structural Annotations in Codebase

All compliance-critical code paths contain explicit review comments:

```typescript
// COMPLIANCE-REVIEW: VAT rate mapping must be validated by local tax advisor.
// Source: Council Directive 2006/112/EC Annex III.
export function getFoodVatRate(countryCode: string): number { ... }
```

```typescript
// COMPLIANCE-REVIEW: DSA Art. 30 requires 5 mandatory data points before listing approval.
export interface SellerRegistrationPayload { ... }
```
