/**
 * @eushop/types — Compliance Schemas
 *
 * Schemas for regulatory data like allergens, quality schemes, etc.
 * These are leaf nodes in the dependency graph to prevent circular imports.
 */
import { z } from 'zod';
import { EU_ALLERGENS_14 } from '@eushop/compliance';

// ─── Allergen ─────────────────────────────────────────────────────────────────

export const AllergenSchema = z.enum(EU_ALLERGENS_14);
export type Allergen = z.infer<typeof AllergenSchema>;
