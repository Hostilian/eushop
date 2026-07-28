---
name: eushop-cpr-declaration-of-performance
description: Skill for validating Declaration of Performance (DoP) documents and essential characteristics codes.
---

# EU Construction Products Regulation (CPR 305/2011) — Declaration of Performance

## Overview
Regulation (EU) 305/2011 (Construction Products Regulation, CPR) requires CE-marked construction products to have a Declaration of Performance (DoP) that declares performance against essential characteristics defined in harmonised European standards (hEN). EUshop must verify DoP document completeness for all construction product listings.

// COMPLIANCE-REVIEW: CPR is being revised. Regulation 2022/0094 (CPR recast) was agreed in 2024. Verify updated requirements before applying to new products.

## Harmonised Technical Specifications

DoP must reference at least one of:
- **Harmonised European Standard (hEN)** — published in the Official Journal of the EU
- **European Technical Assessment (ETA)** — for innovative products without hEN

## Declaration of Performance Schema

```typescript
// packages/compliance/src/cpr.ts
export interface DeclarationOfPerformance {
  dopReference: string;              // Unique DoP reference number
  productName: string;
  productTypeDescription: string;    // Matches intended use in hEN
  intendedUse: string;
  harmonisedStandard?: string;       // e.g. 'EN 13242:2002+A1:2007'
  europeanTechnicalAssessment?: string; // ETA reference if no hEN
  essentialCharacteristics: EssentialCharacteristic[];
  manufacturerName: string;
  manufacturerAddress: string;       // Must include EU establishment
  authorisedRepresentative?: string; // If non-EU manufacturer
  dopDate: Date;
  dopUrl: string;                    // Publicly accessible PDF
  // COMPLIANCE-REVIEW: DoP must be available in all official languages of destination markets
}

export interface EssentialCharacteristic {
  characteristicCode: string;       // e.g. 'NPD', performance level, or threshold
  characteristicName: string;       // e.g. 'Reaction to fire', 'Load bearing capacity'
  performanceLevel: string;         // e.g. 'A1', 'Class B2', 'NPD' (No Performance Determined)
}
```

## "NPD" (No Performance Determined)

```typescript
// packages/compliance/src/cpr.ts
// Manufacturers may declare "NPD" for characteristics not relevant to intended use
// BUT: at least one characteristic must have a declared performance level
export function validateDoP(dop: DeclarationOfPerformance): ValidationResult {
  const errors: string[] = [];

  if (!dop.harmonisedStandard && !dop.europeanTechnicalAssessment) {
    errors.push('DoP must reference either a harmonised standard (hEN) or ETA');
  }

  const nonNpd = dop.essentialCharacteristics.filter(c => c.performanceLevel !== 'NPD');
  if (nonNpd.length === 0) {
    errors.push('At least one essential characteristic must have declared performance (not NPD)');
  }

  if (!dop.dopUrl) {
    errors.push('DoP must be available via a public URL');
  }

  // COMPLIANCE-REVIEW: Validate that declared harmonised standard is listed in the OJEU
  return { valid: errors.length === 0, errors };
}
```

## CE Mark + DoP Number on Listing

```tsx
// apps/web/components/product/ConstructionProductBadge.tsx
export function ConstructionProductCEBadge({ dop }: { dop: DeclarationOfPerformance }) {
  return (
    <div className="ce-dop-badge">
      <span className="ce-mark" aria-label="CE marking">CE</span>
      <div>
        <p>DoP: {dop.dopReference}</p>
        <a href={dop.dopUrl} target="_blank" rel="noopener">View Declaration of Performance</a>
      </div>
    </div>
  );
}
```

## Seller Onboarding Gate

- Seller must upload DoP PDF before any construction product listing is approved
- DoP reference number must be unique and match the uploaded document
- If product has ETA: ETA organisation and number must be provided
- System cross-checks that CE mark appears on product images (visual review required)

## Common Harmonised Standards Reference

| Product | hEN |
|---------|-----|
| Concrete (ready-mixed) | EN 206 |
| Steel for reinforcement | EN 10080 |
| Windows and doors | EN 14351-1 |
| Insulation products | EN 13162 series |
| Roof tiles | EN 1304 |
| Structural timber | EN 14081-1 |

## Source Files
- `packages/compliance/src/cpr.ts`
- `packages/types/src/product.ts` — `ConstructionProductMetadata`
- `apps/web/components/product/ConstructionProductBadge.tsx`
- `services/core-service/src/onboarding/CprValidationService.java`
