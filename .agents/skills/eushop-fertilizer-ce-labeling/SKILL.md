---
name: eushop-fertilizer-ce-labeling
description: Skill for parsing fertilizer PFC/CMC categories and verifying cadmium limit disclosures.
---

# EU Fertilising Products CE Labeling

## Overview
Regulation (EU) 2019/1009 harmonises rules for EU-marked fertilising products. Sellers listing fertilisers on EUshop must provide correct Product Function Category (PFC) and Component Material Category (CMC) codes, CE mark eligibility, and cadmium concentration disclosures.

// COMPLIANCE-REVIEW: Cadmium limits and transitional periods vary by product type and phosphate content. Verify with specialist before enforcing block.

## Product Function Categories (PFC)

| PFC | Product Type | CE Mark Available |
|-----|-------------|------------------|
| PFC 1(A) | Mineral fertiliser (solid) | Yes |
| PFC 1(B) | Mineral fertiliser (liquid) | Yes |
| PFC 2 | Liming material | Yes |
| PFC 3 | Soil improver | Yes |
| PFC 4 | Growing medium | Yes |
| PFC 5 | Inhibitor | Yes |
| PFC 6 | Plant biostimulant | Yes |
| PFC 7 | Blended fertilising product | Yes |

## Component Material Categories (CMC) Validation

```typescript
// packages/compliance/src/fertilizer.ts
export const VALID_CMC_CODES = [
  'CMC1',  // Virgin material substances/mixtures
  'CMC2',  // Plants, plant parts, plant extracts
  'CMC3',  // Compost
  'CMC4',  // Fresh plant material digestate
  'CMC5',  // Food/feed industry by-products
  'CMC6',  // Animal by-products (ABP)
  'CMC7',  // Struvite
  'CMC8',  // Biochar
  'CMC9',  // Pyrolysis/gasification materials
  'CMC10', // Derived microbial products
  'CMC11', // By-products (non-ABP)
] as const;

export function validateCMCCode(cmcCode: string): boolean {
  return VALID_CMC_CODES.includes(cmcCode as any);
}
```

## Cadmium Limit Enforcement

```typescript
// packages/compliance/src/fertilizer.ts
// Cadmium limits (mg Cd per kg P2O5) — COMPLIANCE-REVIEW: transitional limits apply
const CADMIUM_LIMITS = {
  phase1: 60,   // Until 16 July 2026
  phase2: 40,   // 16 July 2026 – 16 July 2031
  phase3: 20,   // From 16 July 2031
} as const;

export function validateCadmiumContent(
  cadmiumMgPerKgP2O5: number,
  currentDate: Date = new Date()
): CadmiumValidation {
  const year = currentDate.getFullYear();
  const limit = year < 2026 ? CADMIUM_LIMITS.phase1
    : year < 2031 ? CADMIUM_LIMITS.phase2
    : CADMIUM_LIMITS.phase3;

  return {
    withinLimit: cadmiumMgPerKgP2O5 <= limit,
    limit,
    actualValue: cadmiumMgPerKgP2O5,
    // COMPLIANCE-REVIEW: Review limit at each phase transition date
  };
}
```

## Label Requirements

All EU-marked fertilising product listings must display:
1. Product Function Category (PFC) code and description
2. Component Material Category (CMC) codes
3. Cadmium concentration (if phosphate fertiliser)
4. CE mark — only for products meeting Reg. 2019/1009 requirements
5. Responsible Person name and address (EU-based)
6. Batch/lot number and production date

## Seller Onboarding Gate

```typescript
if (product.type === 'FERTILISER') {
  const errors = validateFertiliserListing(product);
  if (errors.length > 0) {
    throw new ComplianceBlockError(
      `Fertiliser listing blocked: ${errors.join(', ')}`
    );
  }
}
```

## Source Files
- `packages/compliance/src/fertilizer.ts`
- `packages/types/src/product.ts` — `FertiliserMetadata`
- `services/core-service/src/onboarding/FertiliserValidationService.java`
