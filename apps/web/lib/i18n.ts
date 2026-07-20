/**
 * Internationalization (i18n) translation dictionary for EU Annex II food allergens.
 * EU Reg. 1169/2011 Annex II official translations across major EU Single Market languages.
 *
 * Single Source of Regulatory Truth: keys derived from @eushop/compliance EU_ALLERGENS_14.
 */
import { EU_ALLERGENS_14, type EUAllergen } from '@eushop/compliance';

export type SupportedLanguage = 'en' | 'de' | 'fr' | 'it' | 'es' | 'cs';

export const ALLERGEN_TRANSLATIONS: Record<EUAllergen, Record<SupportedLanguage, string>> = {
  'Cereals containing gluten': {
    en: 'Cereals containing gluten',
    de: 'Glutenhaltiges Getreide',
    fr: 'Céréales contenant du gluten',
    it: 'Cereali contenenti glutine',
    es: 'Cereales que contengan gluten',
    cs: 'Obiloviny obsahující lepek',
  },
  'Crustaceans': {
    en: 'Crustaceans',
    de: 'Krebstiere',
    fr: 'Crustacés',
    it: 'Crostacei',
    es: 'Crustáceos',
    cs: 'Korýši',
  },
  'Eggs': {
    en: 'Eggs',
    de: 'Eier',
    fr: 'Œufs',
    it: 'Uova',
    es: 'Huevos',
    cs: 'Vejce',
  },
  'Fish': {
    en: 'Fish',
    de: 'Fische',
    fr: 'Poissons',
    it: 'Pesce',
    es: 'Pescado',
    cs: 'Ryby',
  },
  'Peanuts': {
    en: 'Peanuts',
    de: 'Erdnüsse',
    fr: 'Arachides',
    it: 'Arachidi',
    es: 'Cacahuetes',
    cs: 'Arašídy',
  },
  'Soybeans': {
    en: 'Soybeans',
    de: 'Sojabohnen',
    fr: 'Soja',
    it: 'Soia',
    es: 'Soja',
    cs: 'Sójové boby',
  },
  'Milk': {
    en: 'Milk',
    de: 'Milch',
    fr: 'Lait',
    it: 'Latte',
    es: 'Leche',
    cs: 'Mléko',
  },
  'Nuts': {
    en: 'Nuts',
    de: 'Schalenfrüchte',
    fr: 'Fruits à coque',
    it: 'Frutta a guscio',
    es: 'Frutos de cáscara',
    cs: 'Skořápkové plody',
  },
  'Celery': {
    en: 'Celery',
    de: 'Sellerie',
    fr: 'Céleri',
    it: 'Sedano',
    es: 'Apio',
    cs: 'Celer',
  },
  'Mustard': {
    en: 'Mustard',
    de: 'Senf',
    fr: 'Moutarde',
    it: 'Senape',
    es: 'Mostaza',
    cs: 'Hořčice',
  },
  'Sesame seeds': {
    en: 'Sesame seeds',
    de: 'Sesamsamen',
    fr: 'Graines de sésame',
    it: 'Semi di sesamo',
    es: 'Granos de sésamo',
    cs: 'Sezamová semena',
  },
  'Sulphur dioxide and sulphites': {
    en: 'Sulphur dioxide and sulphites',
    de: 'Schwefeldioxid und Sulfite',
    fr: 'Anhydride sulfureux et sulfites',
    it: 'Anidride solforosa e solfiti',
    es: 'Dióxido de azufre y sulfitos',
    cs: 'Oxid siřičitý a siřičitany',
  },
  'Lupin': {
    en: 'Lupin',
    de: 'Lupinen',
    fr: 'Lupin',
    it: 'Lupini',
    es: 'Altramuces',
    cs: 'Vlčí bob (lupina)',
  },
  'Molluscs': {
    en: 'Molluscs',
    de: 'Weichtiere',
    fr: 'Mollusques',
    it: 'Molluschi',
    es: 'Moluscos',
    cs: 'Měkkýši',
  },
};

export function translateAllergen(allergen: EUAllergen | string, lang: SupportedLanguage = 'en'): string {
  const entry = ALLERGEN_TRANSLATIONS[allergen as EUAllergen];
  if (entry && entry[lang]) {
    return entry[lang];
  }
  return allergen;
}
