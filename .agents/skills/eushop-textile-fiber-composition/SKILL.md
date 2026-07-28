---
name: eushop-textile-fiber-composition
description: Skill for validating textile fiber composition listings against official EU fiber dictionaries.
---

# EU Textile Fiber Composition Labeling

## Overview
Regulation (EU) 1007/2011 on textile fibre names and labelling requires that all textile product listings display accurate fiber composition using only official EU-approved fiber names, with percentages totalling exactly 100%.

// COMPLIANCE-REVIEW: Regulation 1007/2011 Annex I is updated periodically. Verify the full list against the latest Official Journal publication.

## Official EU Fiber Names (Key Examples from Annex I)

```typescript
// packages/compliance/src/textile.ts
// IMPORTANT: Only these names (and their equivalents in all 24 EU languages) are permitted
export const EU_APPROVED_FIBERS = [
  // Natural fibers
  'wool', 'cashmere', 'angora', 'alpaca', 'vicuna', 'lama', 'camel hair',
  'silk', 'cotton', 'flax', 'hemp', 'jute', 'ramie', 'coconut', 'kapok',
  // Man-made cellulosic
  'viscose', 'modal', 'lyocell', 'cupro', 'acetate', 'triacetate',
  // Synthetic
  'polyester', 'polyamide', 'nylon', 'acrylic', 'modacrylic', 'polypropylene',
  'polyethylene', 'polyurethane', 'elastane', 'elastodiene', 'chlorofibre',
  // Special
  'metal fibre', 'glass fibre',
  // Generic terms (when specific name unknown)
  'other fibres',
] as const;

export type EuApprovedFiber = typeof EU_APPROVED_FIBERS[number];
```

## Fiber Composition Validation

```typescript
// packages/compliance/src/textile.ts
export interface FiberComposition {
  fiberName: EuApprovedFiber;
  percentageByWeight: number;  // Must be an integer 1–100
}

export function validateFiberComposition(
  fibers: FiberComposition[]
): ValidationResult {
  const errors: string[] = [];

  // Rule 1: Total must equal 100%
  const total = fibers.reduce((sum, f) => sum + f.percentageByWeight, 0);
  if (total !== 100) {
    errors.push(`Fiber composition totals ${total}% — must equal exactly 100%`);
  }

  // Rule 2: Only approved fiber names
  for (const fiber of fibers) {
    if (!EU_APPROVED_FIBERS.includes(fiber.fiberName)) {
      errors.push(`Unapproved fiber name: "${fiber.fiberName}"`);
    }
  }

  // Rule 3: Each percentage must be integer ≥ 1
  for (const fiber of fibers) {
    if (!Number.isInteger(fiber.percentageByWeight) || fiber.percentageByWeight < 1) {
      errors.push(`Invalid percentage for ${fiber.fiberName}: ${fiber.percentageByWeight}`);
    }
  }

  return { valid: errors.length === 0, errors };
}
```

## Special Labeling Cases

```typescript
// packages/compliance/src/textile.ts

// "Other fibres" can be used for a total of ≤15% of unlisted minor fibers
export function allowsOtherFibresLabel(compositions: FiberComposition[]): boolean {
  const otherFibres = compositions.find(f => f.fiberName === 'other fibres');
  return !otherFibres || otherFibres.percentageByWeight <= 15;
}

// Non-textile parts of animal origin (e.g., leather trim, feather fill)
// must carry separate disclosure: "Contains non-textile parts of animal origin"
export const ANIMAL_ORIGIN_DISCLOSURE_REQUIRED = [
  'leather', 'suede', 'sheepskin', 'feathers', 'down', 'fur',
] as const;
```

## Product Label Display

Mandatory on all textile product pages:
1. Full fiber composition in descending order by weight percentage
2. Only official EU fiber names (translated per UI locale)
3. Non-textile animal-origin parts disclosed with dedicated label
4. Country of origin (for products making "Made in [country]" claims)

## Source Files
- `packages/compliance/src/textile.ts`
- `packages/types/src/product.ts` — `TextileMetadata`
- `apps/web/components/product/FiberCompositionDisplay.tsx`
