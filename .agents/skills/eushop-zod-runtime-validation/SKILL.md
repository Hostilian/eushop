---
name: eushop-zod-runtime-validation
description: Zod Runtime Validation Skill — enforces runtime type safety at all API boundaries, form inputs, and database read paths in EUshop.
---

# Zod Runtime Validation Patterns

## Why Zod at Runtime
TypeScript only checks types at compile time. Zod validates at runtime — essential at API boundaries where external data enters.

## Where to Validate
1. **API request body** — every POST/PUT endpoint
2. **API response parsing** — when calling external APIs
3. **Form submissions** — before sending to backend
4. **Database reads** — for critical compliance data (allergens, VAT rates)

## Standard Validation Wrapper
```typescript
// packages/types/src/validate.ts
import { ZodSchema, ZodError } from 'zod';

export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(
      result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
    );
  }
  return result.data;
}
```

## Allergen Validation (Compliance-Critical)
```typescript
import { ALLERGENS } from '@eushop/compliance';

const AllergenDeclarationSchema = z.object({
  allergens: z.array(z.enum(ALLERGENS)).min(0),
  containsAllergens: z.boolean(),
  mayContainAllergens: z.array(z.enum(ALLERGENS)).optional(),
});
// COMPLIANCE-REVIEW: Schema changes require compliance package update, not inline
```

## API Response Parsing
```typescript
// Always parse external API responses
const response = await fetch('/api/products');
const raw = await response.json();
const products = z.array(ProductSchema).parse(raw); // throws if API changes shape
```
