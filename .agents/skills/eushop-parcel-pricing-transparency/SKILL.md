---
name: eushop-parcel-pricing-transparency
description: Skill for evaluating cross-border parcel tariffs against European Commission transparent price benchmarks.
---

# EU Cross-Border Parcel Pricing Transparency

## Overview
Regulation (EU) 2018/644 on cross-border parcel delivery services requires postal operators and marketplaces to provide transparent, non-discriminatory access to delivery options. EUshop must display carrier prices clearly, avoid unjustifiable cross-border surcharges, and ensure non-discriminatory delivery access to remote EU regions (e.g. islands, outermost regions).

// COMPLIANCE-REVIEW: The European Commission publishes reference price benchmarks annually. Update carrier rate comparisons against the latest EC benchmark list.

## Key Requirements

| Obligation | Trigger | Platform Action |
|-----------|---------|----------------|
| Show itemised shipping cost | At checkout step | Display carrier + price + delivery estimate |
| Non-discriminatory delivery | Remote EU regions | Cannot reject order due to island/remote location |
| Transparent tariffs | Cross-border B2C | Show pre-tax and post-tax shipping price |
| Carrier selection | Multiple options | Offer ≥1 affordable option when available |

## Shipping Rate Display Schema

```typescript
// packages/types/src/shipping.ts
export interface ShippingOption {
  carrierId: string;
  carrierName: string;           // e.g. 'DHL', 'DPD', 'Chronopost'
  serviceLevel: 'STANDARD' | 'EXPRESS' | 'ECONOMY';
  estimatedDeliveryDays: { min: number; max: number };
  priceEUR: number;              // Pre-tax
  vatAmount: number;
  totalPriceEUR: number;         // Pre-tax + VAT
  destinationCountryCode: string;
  isTrackable: boolean;
  isCrossBorder: boolean;
  // COMPLIANCE-REVIEW: Verify no hidden surcharges applied after this display
}
```

## EC Benchmark Price Check

```typescript
// packages/compliance/src/parcel.ts
export interface EcBenchmarkRate {
  originCountry: string;
  destinationCountry: string;
  weightKg: number;
  ecBenchmarkPriceEUR: number;   // Published by EC annually
  year: number;
}

export function checkAgainstEcBenchmark(
  carrierPriceEUR: number,
  benchmark: EcBenchmarkRate
): BenchmarkCheckResult {
  const ratio = carrierPriceEUR / benchmark.ecBenchmarkPriceEUR;
  return {
    isWithinBenchmark: ratio <= 1.5, // Flag if >150% of benchmark
    ratio,
    // COMPLIANCE-REVIEW: "Unjustifiable" surcharge has no fixed legal definition — flag >150% for review
  };
}
```

## Non-Discriminatory Delivery Rules

```typescript
// packages/compliance/src/parcel.ts
// Regions that must not be excluded from delivery
export const EU_REMOTE_REGIONS = [
  'GR-M', // Greek Aegean islands
  'PT-20', // Azores
  'PT-30', // Madeira
  'ES-CN', // Canary Islands
  'FR-GF', // French Guiana
  'FR-GP', // Guadeloupe
  'FR-MQ', // Martinique
  'FR-RE', // Réunion
  'FR-YT', // Mayotte
  'FI-XX', // Remote Finnish islands
] as const;

export function validateDeliveryOptions(
  options: ShippingOption[],
  buyerRegion: string
): void {
  if (EU_REMOTE_REGIONS.includes(buyerRegion as any) && options.length === 0) {
    // COMPLIANCE-REVIEW: Platform cannot refuse delivery to outermost regions
    // without objective justification. Log and escalate.
    throw new ComplianceError('No delivery options for EU remote region — review required');
  }
}
```

## Checkout UI Rules

- Show **total landed cost** (product + shipping + VAT) before payment confirmation
- No hidden "remote region" surcharge added silently after carrier selection
- If carrier doesn't serve destination: show "Currently unavailable to this region" with link to alternative carriers — do NOT silently remove the item from cart

## Source Files
- `packages/compliance/src/parcel.ts`
- `packages/types/src/shipping.ts` — `ShippingOption`
- `apps/web/components/checkout/ShippingSelector.tsx`
- `services/core-service/src/shipping/ShippingRateService.java`
