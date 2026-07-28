---
name: eushop-right-to-repair-parts
description: Skill for evaluating spare parts availability, repair manual links, and repairability score badges.
---

# EU Right to Repair (Directive 2024/1791)

## Overview
Directive 2024/1791 on the right to repair requires manufacturers of certain product categories to make spare parts, repair tools, and repair information available to consumers and independent repairers at fair, non-discriminatory prices. EUshop must display repair information on relevant product pages and enforce seller compliance at onboarding.

// COMPLIANCE-REVIEW: Directive 2024/1791 must be transposed by member states by July 2026. Verify applicability per product category with each national authority.

## Products Currently in Scope (Under Ecodesign Measures)

| Product | Spare Parts Requirement | Repair Manual Requirement |
|---------|------------------------|--------------------------|
| Washing machines | 10 years after last sale | Yes — publicly accessible |
| Dishwashers | 10 years | Yes |
| Refrigerators | 10 years | Yes |
| TVs / displays | 7 years | Yes |
| Smartphones | 5–7 years | Yes |
| Welding equipment | 7 years | Yes |

## Repair Information Schema

```typescript
// packages/types/src/product.ts
export interface RepairInformation {
  sparePartsAvailableUntil: Date;       // Last date parts are guaranteed available
  repairManualUrl?: string;             // Publicly accessible repair manual link
  repairabilityScore?: number;          // 1.0–10.0 (Ecodesign-mandated for some categories)
  repairabilityClass?: 'A'|'B'|'C'|'D'|'E'|'F'|'G'; // France-style index
  spareParts: SparePartRecord[];        // Key parts that must be available
  officialRepairNetwork?: string;       // Link to authorised repair network
  independentRepairAllowed: boolean;    // Cannot void warranty for independent repair
}

export interface SparePartRecord {
  partName: string;
  partNumber: string;
  pricedFairly: boolean;                // COMPLIANCE-REVIEW: "Fair price" standard is undefined in law
  availabilityStatus: 'IN_STOCK' | 'ORDER_ONLY' | 'DISCONTINUED';
}
```

## Warranty Non-Voidance Rule

```typescript
// packages/compliance/src/rightToRepair.ts
// Under Directive 2024/1791 Art. 5: warranties cannot be voided
// due to use of independent repairers or compatible spare parts
export function validateWarrantyTerms(warrantyText: string): ValidationResult {
  const prohibitedClauses = [
    'warranty void if repaired by',
    'warranty void if opened',
    'only original parts',
    'void if third-party',
  ];

  const foundViolations = prohibitedClauses.filter(clause =>
    warrantyText.toLowerCase().includes(clause)
  );

  return {
    valid: foundViolations.length === 0,
    errors: foundViolations.map(v => `Prohibited warranty clause detected: "${v}"`),
    // COMPLIANCE-REVIEW: Exact wording varies — flag for legal review rather than auto-blocking
  };
}
```

## Product Page UI Requirements

```tsx
// apps/web/components/product/RepairSection.tsx
export function RepairSection({ repairInfo }: { repairInfo: RepairInformation }) {
  return (
    <section aria-label="Repair information">
      {repairInfo.repairabilityScore && (
        <RepairabilityBadge score={repairInfo.repairabilityScore} />
      )}
      {repairInfo.repairManualUrl && (
        <a href={repairInfo.repairManualUrl} target="_blank" rel="noopener">
          Download repair manual (free)
        </a>
      )}
      <p>Spare parts available until: {repairInfo.sparePartsAvailableUntil.toLocaleDateString()}</p>
      {repairInfo.independentRepairAllowed && (
        <p className="repair-notice">
          ✓ Independent repair does not void the manufacturer warranty
        </p>
      )}
    </section>
  );
}
```

## Seller Onboarding Gate

- For applicable product categories: seller **must** provide spare parts availability period
- Repair manual URL must be a publicly accessible, non-paywalled link
- Warranty terms must pass `validateWarrantyTerms()` check before listing approval

## Source Files
- `packages/compliance/src/rightToRepair.ts`
- `packages/types/src/product.ts` — `RepairInformation`
- `apps/web/components/product/RepairSection.tsx`
- `apps/web/components/product/RepairabilityBadge.tsx`
