# Zod Schema Patterns for EUshop Types

## Overview
All shared types are defined as Zod schemas in `packages/types/`. TypeScript types are inferred from schemas.

## Product Schema
```typescript
// packages/types/src/product.ts
import { z } from 'zod';

export const AllergenSchema = z.enum([
  'celery', 'gluten', 'crustaceans', 'eggs', 'fish', 'lupin',
  'milk', 'molluscs', 'mustard', 'nuts', 'peanuts', 'sesame', 'soya', 'sulphites'
]);

export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  sellerId: z.string().uuid(),
  priceEur: z.number().positive().multipleOf(0.01),
  vatRate: z.number().min(0).max(1),
  allergens: z.array(AllergenSchema),
  originCountry: z.string().length(2), // ISO 3166-1 alpha-2
  pdoPgiStatus: z.enum(['PDO', 'PGI', 'TSG', 'NONE']).default('NONE'),
  isFood: z.boolean(),
  gpsrData: z.object({ // Required for non-food
    manufacturerName: z.string(),
    manufacturerAddress: z.string(),
  }).optional(),
});

export type Product = z.infer<typeof ProductSchema>;
```

## Usage Pattern
```typescript
const parsed = ProductSchema.safeParse(input);
if (!parsed.success) throw new ValidationError(parsed.error);
```
