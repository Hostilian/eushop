---
name: eushop-wine-nutrition-e-labeling
description: Skill for parsing digital e-label QR codes, verifying wine energy values, and checking allergen declarations.
---

# EU Wine Digital E-Labeling (Reg. 2021/2117 + 2023/2673)

## Overview
EU Regulation 2021/2117 amended wine CMO rules to require mandatory ingredient and nutrition labelling for all wines produced from 8 December 2023. The nutrition information (except energy value) may be provided via a QR code e-label. EUshop must verify that wine listings include the correct energy value on the physical label and a compliant e-label URL.

// COMPLIANCE-REVIEW: E-label rules were clarified by Delegated Regulation 2023/2668. Verify the exact required fields and e-label restrictions with legal counsel before going live.

## Mandatory On Physical Label

```typescript
// packages/compliance/src/wine.ts
export interface WinePhysicalLabelRequirements {
  energyKJ: number;       // Kilojoules per 100ml — must appear on physical label
  energyKcal: number;     // Kilocalories per 100ml — must appear on physical label
  netVolumeMl: number;    // Volume in ml (e.g. 750)
  actualAlcoholicStrengthPercent: number; // Actual alcohol % by volume
  hasELabel: boolean;     // True if nutrition/ingredient info provided via QR
  eLabelUrl?: string;     // Link to e-label
}

export function validateWinePhysicalLabel(label: WinePhysicalLabelRequirements): ValidationResult {
  const errors: string[] = [];
  if (!label.energyKJ || label.energyKJ <= 0) {
    errors.push('Energy value in kJ is mandatory on physical wine label');
  }
  if (!label.energyKcal || label.energyKcal <= 0) {
    errors.push('Energy value in kcal is mandatory on physical wine label');
  }
  if (label.hasELabel && !label.eLabelUrl) {
    errors.push('E-label URL is required if QR code is used on packaging');
  }
  // COMPLIANCE-REVIEW: Reference intake per 100ml must match EU wine energy calculation method
  return { valid: errors.length === 0, errors };
}
```

## E-Label Content Requirements

```typescript
// packages/compliance/src/wine.ts
export interface WineELabel {
  productName: string;
  vintage?: number;           // Year of harvest
  grapeVarieties?: string[];  // E.g. ['Chardonnay', 'Pinot Grigio']
  wineCategory: string;       // E.g. 'Protected Designation of Origin'
  geographicIndication?: string; // E.g. 'Champagne', 'Rioja'

  // Nutrition per 100ml
  nutritionPer100ml: WineNutritionPer100ml;

  // Ingredients
  ingredients: WineIngredient[];

  // Allergen declaration
  allergens: WineAllergen[];

  // E-label restrictions (Reg. 2023/2668 Art. 4)
  containsNoUserTracking: true;     // E-label MUST NOT track users
  containsNoMarketingContent: true; // E-label MUST NOT contain advertising
  containsNoSalesLinks: true;       // E-label MUST NOT link to purchase
}

export interface WineNutritionPer100ml {
  energyKJ: number;
  energyKcal: number;
  fatG: number;
  saturatesG: number;
  carbohydratesG: number;
  sugarsG: number;
  proteinG: number;
  saltG: number;
}
```

## Wine Allergen Declarations

```typescript
// packages/compliance/src/wine.ts
// Under EU wine rules, sulphites, egg, milk products (fining agents) are common allergens
export const WINE_REGULATED_ALLERGENS = [
  'sulphites',       // "Contains sulphites" mandatory if SO2 > 10 mg/L
  'egg_products',    // If egg-based fining agents used
  'milk_products',   // If casein-based fining agents used
  'fish_products',   // If isinglass used
] as const;

export function getWineAllergenStatement(
  so2MgPerL: number,
  finingAgents: string[]
): string[] {
  const declarations: string[] = [];
  if (so2MgPerL > 10) declarations.push('Contains sulphites');
  if (finingAgents.includes('egg_white') || finingAgents.includes('albumin')) {
    declarations.push('Contains egg products');
  }
  if (finingAgents.includes('casein') || finingAgents.includes('isinglass')) {
    declarations.push('Contains milk products');
    // COMPLIANCE-REVIEW: Isinglass is fish-derived — may also require fish declaration
  }
  return declarations;
}
```

## Energy Value Calculation Reference

Average energy values per 100ml (for validation plausibility check):
- Dry wine (~0g residual sugar): ≈ 70–75 kcal / 293–314 kJ
- Semi-sweet wine: ≈ 80–90 kcal
- Sweet/dessert wine: ≈ 130–150 kcal

```typescript
export function plausibilityCheckEnergyValue(
  energyKcal: number,
  residualSugarGPer100ml: number
): boolean {
  // Very rough plausibility: wines typically 60–180 kcal per 100ml
  // COMPLIANCE-REVIEW: Actual energy calculation method per Reg. (EU) 1169/2011 Annex XIV
  return energyKcal >= 50 && energyKcal <= 250;
}
```

## Source Files
- `packages/compliance/src/wine.ts`
- `packages/types/src/product.ts` — `WineMetadata`
- `apps/web/pages/wines/[slug]/elabel.tsx` — e-label page (no tracking, no marketing)
- `services/core-service/src/onboarding/WineELabelValidationService.java`
