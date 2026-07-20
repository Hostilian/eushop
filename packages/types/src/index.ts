/**
 * @eushop/types
 *
 * Shared TypeScript types and Zod schemas for products, sellers, and orders.
 * One shape, validated identically on both web and mobile clients.
 *
 * Rule 3 from AGENTS.md: "One source of truth for anything regulatory."
 * Compliance-sensitive fields (allergens, kycVerified, vatNumber) are typed
 * strictly here so drift between clients is a compile error, not a runtime bug.
 */
import { z } from 'zod';
import { EU_ALLERGENS_14 } from '@eushop/compliance';

// ─── Allergen ─────────────────────────────────────────────────────────────────

export const AllergenSchema = z.enum(EU_ALLERGENS_14);
export type Allergen = z.infer<typeof AllergenSchema>;

// ─── Seller ───────────────────────────────────────────────────────────────────

/**
 * DSA Art. 30 KYBC data collected at seller onboarding.
 * Both DAC7 and DSA fields are unified here — two separate suspension-timing
 * rules apply (see COMPLIANCE_GAPS.md), but the data collection is one flow.
 */
export const SellerSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  /** DSA Art. 30(b): copy of ID or eIDAS-recognised electronic ID */
  idDocumentRef: z.string().optional(),
  /** DSA Art. 30(d): trade register entry */
  tradeRegisterNumber: z.string().min(1),
  /** DAC7 + DSA: tax identification number */
  taxId: z.string().min(1),
  vatNumber: z.string().optional(),
  address: z.string().min(1),
  countryIso2: z.string().length(2),
  /** DSA Art. 30(e): self-certification that products comply with EU law */
  selfCertifiedCompliant: z.boolean(),
  /**
   * True only after platform has made "best efforts" to verify the above data
   * via official databases (VIES, national trade registers) or supporting docs.
   * COMPLIANCE-REVIEW: "best efforts" is deliberately undefined in DSA Art. 30.
   * Implement the more conservative reading: verify via VIES + trade register
   * lookup before setting this to true.
   */
  kycVerified: z.boolean(),
  rating: z.number().min(0).max(5).optional(),
});

export type Seller = z.infer<typeof SellerSchema>;

// ─── Product ──────────────────────────────────────────────────────────────────

/**
 * Full FIC Art. 14 pre-purchase disclosure schema.
 * All mandatory fields must be present before a listing can be published.
 *
 * COMPLIANCE-REVIEW: For non-prepacked / made-to-order items, only allergens
 * are strictly mandatory pre-purchase under Art. 14. All other fields are
 * strongly recommended. See COMPLIANCE_GAPS.md §1.
 */
export const ProductSchema = z.object({
  id: z.string(),
  /** EU FIC 1169/2011 Art. 9(1)(a): name of the food */
  name: z.string().min(1),
  sellerId: z.string(),
  /** EU FIC 1169/2011 Art. 9(1)(i): country of origin / place of provenance when required */
  countryIso2: z.string().length(2),
  /** EU FIC 1169/2011 Art. 9(1)(b): full ingredient list in descending weight order */
  ingredients: z.string().optional(),
  /** EU FIC 1169/2011 Annex II: 14 regulated allergen categories as structured fields */
  allergens: z.array(AllergenSchema),
  /** EU FIC 1169/2011 Art. 9(1)(e): net quantity */
  netQuantity: z.string().optional(),
  /** EU FIC 1169/2011 Art. 9(1)(f): best-before / use-by date (may wait until delivery for distance sales) */
  bestBeforeDate: z.string().optional(),
  /** Static/demo-safe explanation when the batch-specific date is not known pre-purchase. */
  durabilityInformation: z.string().optional(),
  /** EU FIC 1169/2011 Art. 9(1)(g): special storage / conditions of use */
  storageInstructions: z.string().optional(),
  /** EU FIC 1169/2011 Art. 9(1)(j): instructions where appropriate use would otherwise be difficult */
  instructionsForUse: z.string().optional(),
  /** EU FIC 1169/2011 Art. 9(1)(h): responsible food business operator */
  foodBusinessOperator: z.object({
    name: z.string().min(1),
    address: z.string().min(1),
  }).optional(),
  /** Seller-supplied origin/provenance wording; whether it is mandatory depends on Art. 26 and product context. */
  originStatement: z.string().optional(),
  /** EU FIC 1169/2011 Art. 9(1)(l): nutrition declaration per 100g/100ml */
  nutritionPer100g: z
    .object({
      energyKj: z.number().optional(),
      energyKcal: z.number(),
      fatG: z.number(),
      saturatedFatG: z.number(),
      carbohydrateG: z.number(),
      sugarsG: z.number(),
      proteinG: z.number(),
      saltG: z.number(),
    })
    .optional(),
  price: z.number().positive(),
  description: z.string(),
  category: z.string().optional(),
  imageUrl: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  finderFee: z.number().nonnegative().optional(),
  /**
   * EU quality scheme designation (PDO/PGI/TSG under Reg. 1151/2012).
   * COMPLIANCE-REVIEW: Only render the badge after platform has verified the
   * claim — never on unverified seller self-entry.
   */
  qualityScheme: z.enum(['PDO', 'PGI', 'TSG']).optional(),
  qualitySchemeVerified: z.boolean().optional(),
  /**
   * Whether this is a prepacked food item.
   * Determines which FIC Art. 14 fields are mandatory pre-purchase.
   */
  isPrepacked: z.boolean().default(true),
  /**
   * Product type flag for GPSR compliance code path.
   * Food is excluded from GPSR (Reg. (EU) 2023/988) — non-food items require
   * separate GPSR fields (manufacturer, responsible person, safety warnings).
   */
  productType: z.enum(['food', 'non-food']).default('food'),
  /**
   * GPSR (Regulation (EU) 2023/988 Art. 19): Mandatory disclosures for non-food distance sales.
   * // COMPLIANCE-REVIEW: Required for non-food items offered to EU consumers.
   */
  gpsrManufacturer: z.object({
    name: z.string().min(1),
    address: z.string().min(1),
    email: z.string().email(),
  }).optional(),
  gpsrResponsiblePerson: z.object({
    name: z.string().min(1),
    address: z.string().min(1),
    email: z.string().email(),
  }).optional(),
  gpsrSafetyWarnings: z.array(z.string()).optional(),
  gpsrBatchNumber: z.string().optional(),
  /**
   * Thermal packaging requirement for food transport & cold-chain shipping.
   * Ambient (15-25°C), Chilled (2-8°C), or Frozen (-18°C).
   */
  thermalCategory: z.enum(['ambient', 'chilled_2_8C', 'frozen_minus_18C']).default('ambient'),
});

export type Product = z.infer<typeof ProductSchema>;

// ─── Order ────────────────────────────────────────────────────────────────────

export const OrderSchema = z.object({
  id: z.string(),
  foodId: z.string(),
  sellerId: z.string(),
  buyerId: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  vatRate: z.number().min(0).max(1),
  vatAmount: z.number().nonnegative(),
  finderFee: z.number().nonnegative(),
  shippingCost: z.number().nonnegative(),
  totalPrice: z.number().positive(),
  shippingAddress: z.string().min(1),
  destinationCountryIso2: z.string().length(2),
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
  stripePaymentIntentId: z.string().optional(),
  createdAt: z.string().datetime().optional(),
});

export type Order = z.infer<typeof OrderSchema>;
