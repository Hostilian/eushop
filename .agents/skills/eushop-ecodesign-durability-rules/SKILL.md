---
name: eushop-ecodesign-durability-rules
description: Skill for verifying ESPR Digital Product Passports, reparability scores, and energy label data schemas.
---

# EU Ecodesign & Durability Rules

## Overview
The EU Ecodesign for Sustainable Products Regulation (ESPR, 2024/1781) requires Digital Product Passports (DPP), reparability index scores, and energy efficiency labels for applicable product categories. EUshop must verify seller-uploaded DPP data before listing products subject to ESPR delegated acts.

// COMPLIANCE-REVIEW: ESPR delegated acts are being phased in by product category. Verify which categories are live under your jurisdiction before enforcing.

## Product Categories Currently in Scope

| Product | Regulation | Mandatory Since |
|---------|-----------|----------------|
| Washing machines / dryers | EU 2019/2021 | March 2021 |
| Dishwashers | EU 2019/2021 | March 2021 |
| Refrigerators | EU 2019/2021 | March 2021 |
| TVs / displays | EU 2019/2021 | March 2021 |
| Smartphones | ESPR delegated act | TBC ~2027 |
| Textiles | ESPR delegated act | TBC ~2030 |

## Digital Product Passport (DPP) Schema

```typescript
// packages/types/src/product.ts
export interface DigitalProductPassport {
  productId: string;               // EUshop product UUID
  dppUrl: string;                  // Link to machine-readable DPP data
  energyClass: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  reparabilityScore: number;       // 1.0 – 10.0 (higher = more repairable)
  sparePartsAvailableYears: number; // Manufacturer spare parts commitment
  repairManualUrl?: string;        // Publicly accessible repair manual
  materialComposition?: MaterialRecord[];
  // COMPLIANCE-REVIEW: DPP data registry (CIRPASS) format may require additional fields
}
```

## Reparability Index Display

```tsx
// apps/web/components/product/RepairabilityBadge.tsx
export function RepairabilityBadge({ score }: { score: number }) {
  const grade = score >= 8 ? 'A' : score >= 6 ? 'B' : score >= 4 ? 'C' : 'D';
  return (
    <div aria-label={`Reparability score: ${score}/10 (Grade ${grade})`}>
      <span className="repair-grade">{grade}</span>
      <span className="repair-score">{score.toFixed(1)}/10</span>
    </div>
  );
}
```

## Energy Label Validation

```typescript
// packages/compliance/src/ecodesign.ts
const VALID_ENERGY_CLASSES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;

export function validateEnergyLabel(data: EnergyLabelData): ValidationResult {
  const errors: string[] = [];
  if (!VALID_ENERGY_CLASSES.includes(data.energyClass)) {
    errors.push(`Invalid energy class: ${data.energyClass}`);
  }
  if (data.annualEnergyConsumptionKWh <= 0) {
    errors.push('Annual energy consumption must be positive');
  }
  // COMPLIANCE-REVIEW: QR code must link to EPREL database entry
  if (!data.eprelRegistrationUrl?.includes('eprel.ec.europa.eu')) {
    errors.push('EPREL registration URL required for energy-labelled products');
  }
  return { valid: errors.length === 0, errors };
}
```

## Platform Enforcement

- Block listing of applicable products without valid energy class
- Display DPP link as a persistent QR code / URL on product page
- Show reparability score badge on product card and detail page
- Seller must upload spare parts availability commitment at onboarding

## Source Files
- `packages/compliance/src/ecodesign.ts`
- `packages/types/src/product.ts` — `DigitalProductPassport`
- `apps/web/components/product/RepairabilityBadge.tsx`
- `apps/web/components/product/EnergyLabel.tsx`
