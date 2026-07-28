---
name: eushop-customs-duty-calculation
description: Skill for TARIC code matching, duty estimation, and import VAT calculation for non-EU imports into the Single Market.
---

# Customs Duty Calculation

## Overview
EUshop must apply correct customs duties and import VAT for goods shipped from non-EU countries into the EU Single Market. This skill governs TARIC matching, duty rate lookup, and import VAT application at checkout for cross-border orders.

// COMPLIANCE-REVIEW: Duty rates change frequently. Verify against EU TARIC database before applying rates in production.

## Key Thresholds

| Rule | Value | Notes |
|------|-------|-------|
| Customs duty de minimis | €150 | Goods ≤ €150 exempt from customs duty (NOT import VAT) |
| Import VAT threshold | €0.01 | No de minimis since July 2021 (IOSS reform) |
| IOSS scheme ceiling | €150 | IOSS VAT collected at point of sale for orders ≤ €150 |
| Standard duty declaration | > €150 | Requires formal customs declaration (H1/H7) |

## TARIC Code Matching

```typescript
// packages/compliance/src/customs.ts
export function matchTaricCode(productCategory: string, hsCode: string): TaricMatch {
  // 8-digit CN code (Combined Nomenclature) for EU
  // 10-digit TARIC code adds 2 measure digits
  const cn8 = hsCode.substring(0, 8);
  const taric10 = hsCode.padEnd(10, '0');

  return {
    cnCode: cn8,
    taricCode: taric10,
    // COMPLIANCE-REVIEW: Duty rate must be fetched from live TARIC API, not hardcoded
    dutyRatePercent: lookupDutyRate(taric10),
  };
}
```

## Import VAT Calculation

```typescript
// packages/compliance/src/customs.ts
export function calculateImportVAT(
  goodsValueEUR: number,
  shippingEUR: number,
  dutyEUR: number,
  destinationCountryCode: string
): ImportVATResult {
  // Customs Value = Goods + Shipping + Insurance (CIF basis)
  const customsValue = goodsValueEUR + shippingEUR;
  const vatBase = customsValue + dutyEUR; // duty is included in VAT base
  const vatRate = getVatRate(destinationCountryCode, 'STANDARD');

  return {
    customsValue,
    dutyAmount: dutyEUR,
    vatBase,
    vatAmount: vatBase * (vatRate / 100),
    // COMPLIANCE-REVIEW: Reduced VAT rates may apply for food, books, medicines
  };
}
```

## IOSS Flow (≤ €150)

```
Buyer pays at checkout (EUshop collects VAT via IOSS number)
  → Package ships with IOSS number on customs label
  → Customs clears without collecting duty/VAT at border
  → EUshop remits VAT monthly via IOSS OSS portal
```

## Platform Obligations

- Display total landed cost (goods + shipping + estimated duty + VAT) before order confirmation
- Emit IOSS number on all qualifying shipment labels
- Block listing of prohibited goods (CITES, dual-use, etc.)
- Seller must provide correct HS code at product onboarding

## Never Do

- Never estimate duty using round-number approximations without TARIC lookup
- Never skip import VAT even on low-value shipments post-2021
- Never apply IOSS to goods > €150 — full customs declaration required

## Source Files
- `packages/compliance/src/customs.ts`
- `packages/compliance/src/vat.ts` — `IOSS_CEILING_EUR`
- `services/core-service/src/checkout/CustomsDutyService.java`
