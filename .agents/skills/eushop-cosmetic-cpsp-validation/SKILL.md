---
name: eushop-cosmetic-cpsp-validation
description: Skill for validating CPNP registration numbers, ingredient lists (INCI), and allergen declarations for cosmetic products.
---

# EU Cosmetics CPNP Validation

## Overview
EU Cosmetics Regulation 1223/2009 requires all cosmetic products placed on the EU market to be notified via the Cosmetic Products Notification Portal (CPNP) before sale. EUshop must verify CPNP notification reference numbers and enforce INCI ingredient listing on all cosmetic product detail pages.

// COMPLIANCE-REVIEW: CPNP notifications are EU-only. Post-Brexit UK uses the SCPN portal. Verify seller's responsible person location.

## CPNP Notification Requirements

```typescript
// packages/compliance/src/cosmetics.ts
export interface CpnpNotification {
  notificationId: string;        // CPNP reference number (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx UUID)
  productName: string;
  responsiblePersonName: string;
  responsiblePersonAddress: string; // Must be EU-based
  inciIngredientList: string[];   // Full INCI nomenclature list
  hasAllergenDisclosure: boolean; // Required if fragrance allergens present
  fragranceAllergens?: string[];  // Listed if >0.001% leave-on, >0.01% rinse-off
  // COMPLIANCE-REVIEW: Threshold for fragrance allergen disclosure per Reg 2023/1545
}

export function validateCpnpRecord(record: CpnpNotification): ValidationResult {
  const errors: string[] = [];
  if (!record.notificationId) {
    errors.push('CPNP notification ID is required for all cosmetic listings');
  }
  if (!record.inciIngredientList || record.inciIngredientList.length === 0) {
    errors.push('INCI ingredient list must not be empty');
  }
  if (!record.responsiblePersonAddress.includes('EU')) {
    // COMPLIANCE-REVIEW: Responsible Person must be established in the EU
    errors.push('Responsible Person must be EU-established');
  }
  return { valid: errors.length === 0, errors };
}
```

## INCI Ingredient Display Rules

1. Ingredients must be listed in **descending order of weight** at time of manufacture
2. Ingredients at <1% concentration may be listed in any order after 1%+ ingredients
3. Use official **INCI (International Nomenclature of Cosmetic Ingredients)** names
4. Colorants listed by **CI number** (e.g., `CI 77891` for titanium dioxide)

## Allergen Disclosure (Reg. 2023/1545)

```typescript
// 26 fragrance allergens require explicit disclosure
export const REGULATED_FRAGRANCE_ALLERGENS = [
  'amyl cinnamal', 'amylcinnamyl alcohol', 'anise alcohol', 'benzyl alcohol',
  'benzyl benzoate', 'benzyl cinnamate', 'benzyl salicylate', 'cinnamal',
  'cinnamyl alcohol', 'citral', 'citronellol', 'coumarin', 'eugenol',
  'farnesol', 'geraniol', 'hexyl cinnamaladehyde', 'hydroxycitronellal',
  'hydroxyisohexyl 3-cyclohexene carboxaldehyde', 'isoeugenol',
  'lily aldehyde', 'limonene', 'linalool', 'methyl 2-octynoate',
  'alpha-isomethyl ionone', 'oak moss extract', 'tree moss extract',
] as const;

// Thresholds: >0.001% in leave-on products, >0.01% in rinse-off products
```

## UI Requirements

- Full INCI list displayed in collapsible section on product page
- Fragrance allergen callout box if any regulated allergens present
- CPNP notification badge on seller compliance card (not shown to buyers)

## Source Files
- `packages/compliance/src/cosmetics.ts`
- `packages/types/src/product.ts` — `CosmeticMetadata`
- `apps/web/components/product/IngredientList.tsx`
