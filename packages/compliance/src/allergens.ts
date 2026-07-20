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

export type EUSingleMarketLanguage = 'en' | 'de' | 'fr' | 'it' | 'es' | 'cs';

export const ALLERGEN_I18N: Record<EUAllergen, Record<EUSingleMarketLanguage, string>> = {
  'Cereals containing gluten': { en: 'Cereals containing gluten', de: 'Glutenhaltiges Getreide', fr: 'Céréales contenant du gluten', it: 'Cereali contenenti glutine', es: 'Cereales que contengan gluten', cs: 'Obiloviny obsahující lepek' },
  'Crustaceans': { en: 'Crustaceans', de: 'Krebstiere', fr: 'Crustacés', it: 'Crostacei', es: 'Crustáceos', cs: 'Korýši' },
  'Eggs': { en: 'Eggs', de: 'Eier', fr: 'Œufs', it: 'Uova', es: 'Huevos', cs: 'Vejce' },
  'Fish': { en: 'Fish', de: 'Fische', fr: 'Poissons', it: 'Pesce', es: 'Pescado', cs: 'Ryby' },
  'Peanuts': { en: 'Peanuts', de: 'Erdnüsse', fr: 'Arachides', it: 'Arachidi', es: 'Cacahuetes', cs: 'Arašídy' },
  'Soybeans': { en: 'Soybeans', de: 'Sojabohnen', fr: 'Soja', it: 'Soia', es: 'Soja', cs: 'Sójové boby' },
  'Milk': { en: 'Milk', de: 'Milch', fr: 'Lait', it: 'Latte', es: 'Leche', cs: 'Mléko' },
  'Nuts': { en: 'Nuts (Tree nuts)', de: 'Schalenfrüchte', fr: 'Fruits à coque', it: 'Frutta a guscio', es: 'Frutos de cáscara', cs: 'Skořápkové plody' },
  'Celery': { en: 'Celery', de: 'Sellerie', fr: 'Céleri', it: 'Sedano', es: 'Apio', cs: 'Celer' },
  'Mustard': { en: 'Mustard', de: 'Senf', fr: 'Moutarde', it: 'Senape', es: 'Mostaza', cs: 'Hořčice' },
  'Sesame seeds': { en: 'Sesame seeds', de: 'Sesamsamen', fr: 'Graines de sésame', it: 'Semi di sesamo', es: 'Granos de sésamo', cs: 'Sezamová semena' },
  'Sulphur dioxide and sulphites': { en: 'Sulphur dioxide and sulphites', de: 'Schwefeldioxid und Sulfite', fr: 'Anhydride sulfureux et sulfites', it: 'Anidride solforosa e solfiti', es: 'Dióxido de azufre y sulfitos', cs: 'Oxid siřičitý a siřičitany' },
  'Lupin': { en: 'Lupin', de: 'Lupinen', fr: 'Lupin', it: 'Lupini', es: 'Altramuces', cs: 'Vlčí bob' },
  'Molluscs': { en: 'Molluscs', de: 'Weichtiere', fr: 'Mollusques', it: 'Molluschi', es: 'Moluscos', cs: 'Měkkýši' },
};

/**
 * Single source of truth helper to get the official EU Annex II allergen translation.
 */
export function getAllergenTranslation(allergen: EUAllergen, lang: EUSingleMarketLanguage = 'en'): string {
  return ALLERGEN_I18N[allergen]?.[lang] || allergen;
}
