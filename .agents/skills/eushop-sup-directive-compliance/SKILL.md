---
name: eushop-sup-directive-compliance
description: Skill for detecting banned single-use plastic items and validating turtle marking logos.
---

# EU Single-Use Plastics Directive (SUPD — 2019/904)

## Overview
Directive (EU) 2019/904 (SUPD) bans specific single-use plastic products, requires mandatory marking on certain plastic items, and establishes producer responsibility for plastic waste. EUshop must block listings of banned items, verify mandatory turtle logos, and enforce tethered cap requirements for beverages.

// COMPLIANCE-REVIEW: Some SUPD provisions are implemented differently per member state. Verify national transposition law before applying a hard block vs. a warning.

## Banned Single-Use Plastic Items (Art. 5)

```typescript
// packages/compliance/src/supd.ts
// BANNED from market placement in the EU since 3 July 2021
export const SUP_BANNED_ITEMS = [
  'plastic_cotton_buds',             // Cotton bud sticks
  'plastic_cutlery_forks',           // Forks
  'plastic_cutlery_knives',          // Knives
  'plastic_cutlery_spoons',          // Spoons
  'plastic_cutlery_chopsticks',      // Chopsticks
  'plastic_plates',                  // Plates
  'plastic_straws',                  // Straws
  'plastic_stirrers',                // Stirrers
  'polystyrene_food_containers',     // Expanded polystyrene food containers
  'polystyrene_beverage_cups',       // Expanded polystyrene cups
  'oxo_degradable_plastic_products', // All oxo-degradable plastic products
] as const;

export type SupBannedItem = typeof SUP_BANNED_ITEMS[number];

export function isBannedSingleUsePlastic(
  productCategory: string,
  materialType: string
): boolean {
  // COMPLIANCE-REVIEW: Product classification requires material and use case — not just category name
  // Flag for manual review if material is 'PLASTIC' and category is in banned list
  return SUP_BANNED_ITEMS.includes(productCategory as SupBannedItem);
}
```

## Mandatory Turtle Logo (Art. 7)

```typescript
// packages/compliance/src/supd.ts
// Items requiring mandatory "contains plastic" turtle marking on packaging/label
export const SUP_TURTLE_LOGO_REQUIRED = [
  'sanitary_towels_pads',       // Sanitary towels/pads
  'wet_wipes',                  // Pre-moistened wipes
  'tampons',                    // Tampons (not applicators)
  'tampon_applicators',
  'disposable_menstrual_cups',
  'plastic_beverage_cups',      // Cups for beverages (not lids)
  'lightweight_plastic_bags',   // Below 50 microns
  'tobacco_filters',            // Filters for tobacco products
  'plastic_balloons',           // Excluding industrial use
] as const;

export function requiresTurtleLogo(productCategory: string): boolean {
  return SUP_TURTLE_LOGO_REQUIRED.includes(productCategory as any);
}
```

## Tethered Cap Requirement (Art. 6)

```typescript
// packages/compliance/src/supd.ts
// Plastic caps/lids must remain attached to bottle during use (from 3 July 2024)
// Applies to plastic beverage containers up to 3 litres
export function validateTetheredCap(
  containerVolumeL: number,
  hasTetheredCap: boolean
): ValidationResult {
  if (containerVolumeL > 3) {
    return { valid: true, errors: [] }; // > 3L exempt from tethered cap rule
  }
  return {
    valid: hasTetheredCap,
    errors: hasTetheredCap
      ? []
      : ['Plastic beverage containers ≤3L must have tethered caps per SUPD Art. 6'],
  };
}
```

## Product Listing Enforcement

```typescript
// Applied at product onboarding and every listing submission
export function validateSupDirective(product: ProductMetadata): ComplianceResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Hard block: banned items
  if (isBannedSingleUsePlastic(product.category, product.materialType)) {
    errors.push(`Product category "${product.category}" is banned under SUPD Art. 5`);
  }

  // Warning: missing turtle logo
  if (requiresTurtleLogo(product.category) && !product.hasTurtleLogoOnPackaging) {
    errors.push(`Product requires mandatory "plastics in product" marking under SUPD Art. 7`);
  }

  // Warning: tethered cap
  if (product.isBeverageContainer && product.volumeLitres <= 3) {
    const capCheck = validateTetheredCap(product.volumeLitres, product.hasTetheredCap ?? false);
    errors.push(...capCheck.errors);
  }

  return { valid: errors.length === 0, errors, warnings };
}
```

## Source Files
- `packages/compliance/src/supd.ts`
- `packages/types/src/product.ts` — `SupdMetadata`
- `services/core-service/src/onboarding/SupdValidationService.java`
