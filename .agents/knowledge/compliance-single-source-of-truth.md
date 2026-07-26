---
title: Compliance Single Source of Truth Knowledge Item
category: Legal Compliance
last_updated: 2026-07-26
---

# Compliance Single Source of Truth Knowledge Item (KI-002)

## Regulatory Invariant
All regulatory constants, tax calculation formulas, and allergen metadata MUST originate exclusively from `packages/compliance`:

- **VAT Rates**: `packages/compliance/src/vat.ts` (`calculateFoodVat`, `VAT_RATES_BY_COUNTRY`)
- **DAC7 Thresholds**: `packages/compliance/src/vat.ts` (`DAC7_THRESHOLDS`: €2,000 / 30 transactions)
- **Allergens List**: `packages/compliance/src/allergens.ts` (14 EU Regulated Allergens under Reg. 1169/2011 Annex II)
- **OSS Threshold**: `packages/compliance/src/vat.ts` (€10,000 combined EU cross-border threshold)

## Rule
NEVER copy-paste VAT rates or allergen lists into client code or controller classes. Always import directly from `@eushop/compliance`.
