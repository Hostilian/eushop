/**
 * @eushop/types — V243 Domain Schemas
 *
 * Single source of truth for V243 Food Knowledge Graph, Living Map,
 * Multi-Seller Commerce, and Traceability entities.
 */
import { z } from 'zod';
import { AllergenSchema } from './schemas/compliance';

// ─── Geographical Indication (PDO / PGI / TSG) ──────────────────────────────

export const QualitySchemeTypeSchema = z.enum(['PDO', 'PGI', 'TSG', 'ORGANIC', 'TRADITIONAL_SPECIALTY']);
export type QualitySchemeType = z.infer<typeof QualitySchemeTypeSchema>;

export const GeographicalIndicationSchema = z.object({
  id: z.string(),
  officialName: z.string(),
  schemeType: QualitySchemeTypeSchema,
  eAmbrosiaId: z.string().optional(),
  countryIso2: z.string().length(2),
  registeredZonePolygonRef: z.string().optional(),
  specificationUrl: z.string().url().optional(),
  verifiedAt: z.string().datetime(),
});
export type GeographicalIndication = z.infer<typeof GeographicalIndicationSchema>;

// ─── Food Knowledge Graph Entity & Ontology ───────────────────────────────────

export const OntologyRelationPredicateSchema = z.enum([
  'ORIGINATES_IN',
  'CONTAINS_INGREDIENT',
  'MAY_CONTAIN_ALLERGEN',
  'PROTECTED_BY_GI',
  'PRODUCED_BY_TECHNIQUE',
  'TRADITIONALLY_ASSOCIATED_WITH_REGION',
  'PAIRS_WITH_FOOD',
]);
export type OntologyRelationPredicate = z.infer<typeof OntologyRelationPredicateSchema>;

export const ClaimVerificationStatusSchema = z.enum([
  'VERIFIED',
  'WELL_SUPPORTED',
  'REPORTED',
  'TRADITIONALLY_ASSOCIATED',
  'SELLER_DECLARED',
  'DISPUTED',
  'UNCERTAIN',
]);
export type ClaimVerificationStatus = z.infer<typeof ClaimVerificationStatusSchema>;

export const ClaimProvenanceSchema = z.object({
  claimId: z.string(),
  claimText: z.string(),
  sourceCitation: z.string(),
  verificationStatus: ClaimVerificationStatusSchema,
  verifiedAt: z.string().datetime(),
  confidenceScore: z.number().min(0).max(1),
});
export type ClaimProvenance = z.infer<typeof ClaimProvenanceSchema>;

export const CanonicalFoodSchema = z.object({
  id: z.string(),
  canonicalName: z.string(),
  localNames: z.record(z.string(), z.string()), // e.g. { "fr": "Parmigiano", "it": "Parmigiano Reggiano" }
  category: z.string(),
  originCountryIso2: z.string().length(2),
  originRegion: z.string(),
  historyContext: z.string().optional(),
  traditionalTechnique: z.string().optional(),
  allergens: z.array(AllergenSchema),
  geographicalIndications: z.array(GeographicalIndicationSchema),
  provenanceClaims: z.array(ClaimProvenanceSchema),
});
export type CanonicalFood = z.infer<typeof CanonicalFoodSchema>;

// ─── Producer vs Seller Identity Models (DSA Art. 30) ─────────────────────────

export const ProducerProfileSchema = z.object({
  id: z.string(),
  brandName: z.string(),
  legalEntityName: z.string(),
  countryIso2: z.string().length(2),
  productionFacilityAddress: z.string(),
  geoCoordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  establishedYear: z.number().optional(),
  bioDescription: z.string().optional(),
});
export type ProducerProfile = z.infer<typeof ProducerProfileSchema>;

// ─── Logistics & Shipping Classifications ─────────────────────────────────────

export const PerishabilityClassSchema = z.enum(['AMBIENT', 'CHILLED', 'FROZEN', 'FRAGILE', 'LIQUID', 'PERISHABLE']);
export type PerishabilityClass = z.infer<typeof PerishabilityClassSchema>;

export const ShippingProfileSchema = z.object({
  id: z.string(),
  sellerId: z.string(),
  perishabilityClass: PerishabilityClassSchema,
  handlingTimeHours: z.number().min(0),
  maxTransitDays: z.number().min(1),
  supportedDestinationCountries: z.array(z.string().length(2)),
  requiresInsulatedPackaging: z.boolean(),
});
export type ShippingProfile = z.infer<typeof ShippingProfileSchema>;

// ─── Multi-Seller Orders ──────────────────────────────────────────────────────

export const OrderLineSchema = z.object({
  id: z.string(),
  sellerOrderId: z.string(),
  offerId: z.string(),
  producerProductId: z.string(),
  quantity: z.number().int().min(1),
  unitPriceCents: z.number().int().min(0),
  currency: z.string().length(3),
  totalCents: z.number().int().min(0),
  lotCode: z.string().optional(),
});
export type OrderLine = z.infer<typeof OrderLineSchema>;

export const SellerOrderSchema = z.object({
  id: z.string(),
  marketplaceOrderId: z.string(),
  sellerId: z.string(),
  orderLines: z.array(OrderLineSchema),
  subtotalCents: z.number().int().min(0),
  shippingFeeCents: z.number().int().min(0),
  vatCents: z.number().int().min(0),
  totalCents: z.number().int().min(0),
  currency: z.string().length(3),
  status: z.enum(['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
  fulfillmentCarrier: z.string().optional(),
  trackingNumber: z.string().optional(),
});
export type SellerOrder = z.infer<typeof SellerOrderSchema>;

export const MarketplaceOrderSchema = z.object({
  id: z.string(),
  buyerId: z.string(),
  sellerOrders: z.array(SellerOrderSchema),
  grandTotalCents: z.number().int().min(0),
  currency: z.string().length(3),
  stripePaymentIntentId: z.string(),
  createdAt: z.string().datetime(),
});
export type MarketplaceOrder = z.infer<typeof MarketplaceOrderSchema>;
