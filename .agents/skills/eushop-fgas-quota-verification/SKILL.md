---
name: eushop-fgas-quota-verification
description: Skill for checking HFC quota allocations, GWP figures, and hermetically sealed equipment disclosures.
---

# EU F-Gas Regulation (2024/573) Compliance

## Overview
Regulation (EU) 2024/573 (recast F-Gas Regulation) introduces a phase-down schedule for HFCs, mandatory product labelling with GWP values, and restrictions on the sale of equipment containing certain F-gases. EUshop must verify seller compliance before listing any refrigeration, air conditioning, or heat pump equipment containing F-gases.

// COMPLIANCE-REVIEW: 2024/573 replaces 517/2014 with stricter phase-down schedules. New prohibitions on HFC-containing equipment apply from various dates. Verify exact prohibition dates with legal counsel.

## Products in Scope

| Category | F-Gas Concern |
|----------|--------------|
| Refrigerators/freezers (commercial) | HFC refrigerant content |
| Split AC/heat pumps | GWP > 750 phase-down |
| Mobile AC (cars) | R-134a HFO transition |
| Industrial refrigeration | Large charge equipment |
| Hermetically sealed household fridges | Exempt if pre-charged below thresholds |

## GWP Reference Values (Key Refrigerants)

```typescript
// packages/compliance/src/fgas.ts
// Global Warming Potential relative to CO2 (100-year GWP)
// COMPLIANCE-REVIEW: GWP values from IPCC AR6 report — update if AR7 changes values
export const REFRIGERANT_GWP: Record<string, number> = {
  'R-404A': 3922,
  'R-407C': 1774,
  'R-410A': 2088,
  'R-134a': 1430,
  'R-32': 675,
  'R-290': 3,      // Propane — natural refrigerant
  'R-600a': 3,     // Isobutane — natural refrigerant
  'R-744': 1,      // CO2 — natural refrigerant
  'R-1234yf': 4,   // HFO — low GWP
  'R-454B': 466,   // HFO/HFC blend
} as const;

export function getGwpClass(gwp: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' {
  if (gwp <= 150) return 'LOW';
  if (gwp <= 750) return 'MEDIUM';
  if (gwp <= 2500) return 'HIGH';
  return 'VERY_HIGH';
}
```

## Mandatory Product Label Content

```typescript
// packages/compliance/src/fgas.ts
export interface FgasProductLabel {
  refrigerantName: string;         // e.g. 'R-410A'
  refrigerantGwp: number;          // e.g. 2088
  co2EquivalentKg: number;         // Charge (kg) × GWP
  chargeKg: number;                // Total refrigerant charge
  isHermeticallySealed: boolean;   // Affects leakage check requirements
  requiresCertifiedTechnician: boolean; // For installation of pre-charged equipment
}

export function generateFgasLabelText(label: FgasProductLabel): string {
  return [
    `Contains fluorinated greenhouse gases`,
    `Refrigerant: ${label.refrigerantName}`,
    `GWP: ${label.refrigerantGwp}`,
    `CO₂ equivalent: ${label.co2EquivalentKg.toFixed(2)} t CO₂ eq`,
    label.requiresCertifiedTechnician
      ? 'Installation must be performed by a certified F-gas technician'
      : '',
  ].filter(Boolean).join('\n');
}
```

## Phase-Down Restrictions (Key Dates)

```typescript
// packages/compliance/src/fgas.ts
// COMPLIANCE-REVIEW: These prohibition dates are from 2024/573 Annex III
// Verify exact product codes before enforcing a listing block
export const FGAS_PROHIBITIONS = [
  {
    fromDate: new Date('2025-01-01'),
    gwpThreshold: 2500,
    category: 'Hermetically sealed refrigerators and freezers (commercial)',
    description: 'Cannot place on market if GWP > 2500'
  },
  {
    fromDate: new Date('2025-01-01'),
    gwpThreshold: 750,
    category: 'Refrigerators and freezers for professional use',
    description: 'Cannot place on market if GWP > 750'
  },
  {
    fromDate: new Date('2027-01-01'),
    gwpThreshold: 750,
    category: 'Moveable room AC',
    description: 'Cannot place on market if GWP > 750'
  },
] as const;

export function checkFgasProhibition(
  refrigerantGwp: number,
  productCategory: string,
  listingDate: Date
): FgasProhibitionResult {
  for (const prohibition of FGAS_PROHIBITIONS) {
    if (
      listingDate >= prohibition.fromDate &&
      productCategory.includes(prohibition.category.split(' ')[0]) &&
      refrigerantGwp > prohibition.gwpThreshold
    ) {
      return { prohibited: true, reason: prohibition.description };
    }
  }
  return { prohibited: false };
}
```

## Source Files
- `packages/compliance/src/fgas.ts`
- `packages/types/src/product.ts` — `FgasMetadata`
- `apps/web/components/product/FgasLabel.tsx`
- `services/core-service/src/onboarding/FgasValidationService.java`
