# GPSR Non-Food Product Safety Requirements

## Overview
EU General Product Safety Regulation (EU 2023/988 - GPSR) applies to all non-food products sold on EUshop. Food products are EXPLICITLY EXEMPT.

## Required GPSR Fields (Non-Food Products Only)
```typescript
// packages/types/src/product.ts
const GpsrDataSchema = z.object({
  manufacturerName: z.string().min(1),
  manufacturerAddress: z.string().min(1),
  manufacturerContact: z.string().email().or(z.string().url()),
  euRepresentativeName: z.string().optional(), // Required if non-EU manufacturer
  euRepresentativeAddress: z.string().optional(),
  riskAssessmentStatus: z.enum(['ASSESSED', 'PENDING', 'NOT_REQUIRED']),
  safetyNoticeStatus: z.enum(['NO_NOTICE', 'ACTIVE_NOTICE', 'RECALLED']),
  technicalDocumentationAvailable: z.boolean(),
});
```

## Product Category Classification
```sql
-- FOOD: Exempt from GPSR, subject to FIC 1169/2011 allergen rules
-- NON_FOOD: Subject to GPSR, exempt from allergen rules
ALTER TABLE products ADD COLUMN product_category TEXT NOT NULL CHECK (
  product_category IN ('FOOD', 'NON_FOOD', 'COSMETIC', 'TEXTILE', 'ELECTRONIC', 'TOY')
);
```

## Blocking Rule
Non-food listings MUST NOT go live without all 5 required GPSR fields populated.

// COMPLIANCE-REVIEW: Verify GPSR implementation against EU 2023/988 before launch
