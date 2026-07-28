---
name: eushop-packaging-waste-ppwr-rules
description: Skill for calculating packaging weight, recyclability grades, and EPR packaging fee breakdowns.
---

# EU Packaging & Packaging Waste (PPWR) Regulation

## Overview
The EU Packaging and Packaging Waste Regulation (PPWR, replacing Directive 94/62/EC) introduces mandatory recyclability grades, waste prevention targets, and Extended Producer Responsibility (EPR) registration for all sellers placing packaged goods on the EU market. EUshop must collect packaging metadata from sellers and calculate EPR fee obligations.

// COMPLIANCE-REVIEW: PPWR negotiation was finalised in 2024. National EPR fee rates differ per member state and scheme. Verify with local EPR scheme before applying rates.

## Recyclability Grades (Design for Recycling)

```typescript
// packages/compliance/src/packaging.ts
export type RecyclabilityGrade = 'A' | 'B' | 'C' | 'D' | 'F';
// A = fully recyclable at scale, F = not recyclable / to be phased out

export interface PackagingMaterial {
  materialType: PackagingMaterialType;
  weightGrams: number;
  recyclabilityGrade: RecyclabilityGrade;
  isRefillable?: boolean;
  isReusable?: boolean;
  recycledContentPercent?: number;   // Mandatory disclosure from 2030
}

export type PackagingMaterialType =
  | 'CARDBOARD'
  | 'CORRUGATED_BOARD'
  | 'PLASTIC_PET'
  | 'PLASTIC_HDPE'
  | 'PLASTIC_PP'
  | 'PLASTIC_MIXED'
  | 'GLASS'
  | 'ALUMINIUM'
  | 'STEEL'
  | 'PAPER'
  | 'WOOD'
  | 'COMPOSITE'; // COMPLIANCE-REVIEW: composites often grade D/F
```

## EPR Fee Calculation

```typescript
// packages/compliance/src/packaging.ts
// EPR fees are set by national EPR schemes — rates below are illustrative
// COMPLIANCE-REVIEW: Always use current year rates from the registered EPR scheme
const EPR_RATE_EUR_PER_KG: Record<string, Record<PackagingMaterialType, number>> = {
  DE: {
    CARDBOARD: 0.12,
    PLASTIC_PET: 0.89,
    PLASTIC_HDPE: 0.72,
    PLASTIC_PP: 0.68,
    PLASTIC_MIXED: 1.20,
    GLASS: 0.04,
    ALUMINIUM: 0.38,
    STEEL: 0.22,
    PAPER: 0.10,
    WOOD: 0.08,
    CORRUGATED_BOARD: 0.11,
    COMPOSITE: 1.50,
  },
  // FR, IT, ES etc. have separate scheme rates
};

export function calculateEprFee(
  materials: PackagingMaterial[],
  countryCode: string
): EprFeeResult {
  const rates = EPR_RATE_EUR_PER_KG[countryCode];
  if (!rates) throw new Error(`EPR rates not configured for ${countryCode}`);

  let totalFeeEUR = 0;
  for (const mat of materials) {
    const ratePerKg = rates[mat.materialType] ?? 1.50; // Conservative fallback
    totalFeeEUR += (mat.weightGrams / 1000) * ratePerKg;
  }

  return { totalFeeEUR, countryCode, breakdown: materials };
}
```

## Mandatory Sorting Labels

```tsx
// apps/web/components/product/PackagingSortingLabel.tsx
// Triman logo (France) + Green Dot (DE/AT) must be displayed where contractually required
// COMPLIANCE-REVIEW: Green Dot licence fee must be paid if logo is used in those markets
export function PackagingSortingInstructions({ materials }: { materials: PackagingMaterial[] }) {
  return (
    <div className="packaging-sorting">
      <h3>Packaging & Recycling</h3>
      {materials.map(mat => (
        <p key={mat.materialType}>
          {mat.weightGrams}g {formatMaterialName(mat.materialType)} — {getSortingInstruction(mat)}
        </p>
      ))}
    </div>
  );
}
```

## PPWR Prohibited Packaging (from 2030)

- Single-serve sachets/portions in the food-service sector
- Non-recyclable composite packaging grades D/F (phase-out timeline)
- Unnecessary packaging (packaging exceeding necessary minimum size)

## Seller EPR Registration Check

- Seller must provide national EPR packaging registration number per market
- EUshop must report seller packaging data to national EPR schemes annually
- Store packaging weight data per order for EPR return calculations

## Source Files
- `packages/compliance/src/packaging.ts`
- `packages/types/src/product.ts` — `PackagingMetadata`
- `services/core-service/src/reporting/EprPackagingReportService.java`
