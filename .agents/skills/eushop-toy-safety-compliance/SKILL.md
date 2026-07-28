---
name: eushop-toy-safety-compliance
description: Skill for validating toy safety age warnings, CE mark requirements, and small parts hazard labels.
---

# EU Toy Safety Directive (2009/48/EC)

## Overview
Directive 2009/48/EC on the safety of toys requires CE marking, mandatory safety warnings, chemical safety limits, and a technical file for all toys intended for children under 14. EUshop must validate seller-provided toy safety data before listing.

// COMPLIANCE-REVIEW: The Toy Safety Regulation (replacing 2009/48/EC) is being finalised with stricter chemical limits. Monitor Official Journal for publication date.

## Mandatory Warnings by Age Category

```typescript
// packages/compliance/src/toySafety.ts
export const TOY_SAFETY_WARNINGS: Record<string, string> = {
  UNDER_3: 'Warning. Not suitable for children under 36 months. Choking hazard – small parts.',
  UNDER_3_BALLOON: 'Warning! Latex balloons. Choking hazard. Children under 8 years can choke or suffocate on un-inflated or broken balloons.',
  UNDER_3_FUNCTIONAL_TOY: 'Warning. Not suitable for children under 36 months.',
  ADULT_SUPERVISION: 'Warning. Adult supervision required.',
  WATER_TOY: 'Warning. Use only under direct adult supervision in water.',
  PROTECTIVE_EQUIPMENT: 'Warning. Always wear protective equipment when using this toy.',
};

export function getRequiredWarnings(toyMetadata: ToyMetadata): string[] {
  const warnings: string[] = [];
  if (toyMetadata.smallPartsRisk) warnings.push(TOY_SAFETY_WARNINGS.UNDER_3);
  if (toyMetadata.isWaterToy) warnings.push(TOY_SAFETY_WARNINGS.WATER_TOY);
  if (toyMetadata.requiresAdultSupervision) warnings.push(TOY_SAFETY_WARNINGS.ADULT_SUPERVISION);
  return warnings;
}
```

## Small Parts Hazard Detection

```typescript
// packages/compliance/src/toySafety.ts
// "Small parts" = any part that fits entirely in the Small Parts Test Cylinder
// per ASTM F963 / EN 71 — approximately: fits in a cylinder 57.1mm x 31.7mm
export const SMALL_PARTS_CYLINDER_MM = { diameter: 31.7, length: 57.1 } as const;

export interface ToyMetadata {
  minimumAgeMonths: number;
  smallPartsRisk: boolean;          // True if any component can fit cylinder test
  isWaterToy: boolean;
  requiresAdultSupervision: boolean;
  batteryOperated: boolean;
  isElectricToy: boolean;
  chemicalComplianceCertUrl?: string; // EN 71-3 migration test for chemical toys
  technicalFileUrl?: string;         // DoC + technical file PDF
  notifiedBodyNumber?: string;       // Required for specific categories (e.g. fireworks)
}
```

## Chemical Safety Requirements (EN 71-3)

```typescript
// packages/compliance/src/toySafety.ts
// Maximum migration limits (mg/kg) for toy materials
// COMPLIANCE-REVIEW: Regulation 2017/738 updates limits — verify against latest amendment
export const EN71_3_MIGRATION_LIMITS_SCRAPED = {
  antimony: { dry: 45, liquid: 11.3, modellingClay: 17 },
  arsenic: { dry: 3.8, liquid: 0.9, modellingClay: 1.9 },
  barium: { dry: 4500, liquid: 1125, modellingClay: 2250 },
  cadmium: { dry: 1.9, liquid: 0.5, modellingClay: 0.9 },
  chromium_VI: { dry: 0.2, liquid: 0.05, modellingClay: 0.1 },
  lead: { dry: 2.0, liquid: 0.5, modellingClay: 1.0 },
  // COMPLIANCE-REVIEW: Full table in EN 71-3:2019+A1:2021
} as const;
```

## CE Mark Validation for Toys

```typescript
export function validateToyCeMark(toy: ToyMetadata): ValidationResult {
  const errors: string[] = [];

  if (!toy.technicalFileUrl) {
    errors.push('Technical file / EU Declaration of Conformity required for CE marking');
  }
  if (toy.minimumAgeMonths < 36 && !toy.smallPartsRisk !== false) {
    // Must explicitly declare whether small parts risk exists
    errors.push('Small parts risk assessment required for toys for children under 36 months');
  }
  if (toy.isElectricToy && !toy.technicalFileUrl) {
    errors.push('Electric toys require additional LVD + EMC conformity documentation');
  }

  return { valid: errors.length === 0, errors };
}
```

## Product Page UI Requirements

- Age warning label displayed prominently above the fold
- CE mark visible on product images
- "Small parts – choking hazard" warning in red callout if applicable
- Link to EU safety declaration (DoC) in product details
- Manufacturer address displayed on listing (must be EU-registered economic operator)

## Source Files
- `packages/compliance/src/toySafety.ts`
- `packages/types/src/product.ts` — `ToyMetadata`
- `apps/web/components/product/ToyWarningBadge.tsx`
- `services/core-service/src/onboarding/ToySafetyValidationService.java`
