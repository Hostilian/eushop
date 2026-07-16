/**
 * EU-regulated allergens under Regulation (EU) No 1169/2011, Annex II.
 * This is the single source of truth for allergen data across web and mobile.
 * Do NOT duplicate this list in any client — import from here.
 *
 * COMPLIANCE-REVIEW: Verify this list against the current Annex II text before launch.
 * Source: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32011R1169
 */
export const EU_ALLERGENS_14 = [
  'Cereals containing gluten',
  'Crustaceans',
  'Eggs',
  'Fish',
  'Peanuts',
  'Soybeans',
  'Milk',
  'Nuts',
  'Celery',
  'Mustard',
  'Sesame seeds',
  'Sulphur dioxide and sulphites',
  'Lupin',
  'Molluscs',
] as const;

export type EUAllergen = (typeof EU_ALLERGENS_14)[number];

/**
 * FDA major allergens under FALCPA + FASTER Act (effective Jan 1 2023).
 * Sesame is the 9th allergen added by the FASTER Act.
 * Structured as an extensible list so adding future allergens is a config change.
 *
 * COMPLIANCE-REVIEW: Verify against current FDA guidance before US expansion.
 * Source: https://www.fda.gov/food/food-allergies/food-allergen-labeling-and-consumer-protection-act-2004-falcpa
 */
export const FDA_ALLERGENS_9 = [
  'Milk',
  'Eggs',
  'Fish',
  'Crustacean shellfish',
  'Tree nuts',
  'Peanuts',
  'Wheat',
  'Soybeans',
  'Sesame',
] as const;

export type FDAAllergen = (typeof FDA_ALLERGENS_9)[number];
