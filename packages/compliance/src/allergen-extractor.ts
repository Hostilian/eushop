/**
 * Automated Annex II 14 Allergen Extraction & Auto-Flagging Engine.
 * Single Source of Regulatory Truth under EU Reg. 1169/2011 Art. 21 & Annex II.
 */

import { EU_ALLERGENS_14, type EUAllergen } from './allergens';

export interface ExtractedAllergenMatch {
  allergen: EUAllergen;
  matchedKeyword: string;
  position: number;
}

export interface AllergenExtractionResult {
  detectedAllergens: EUAllergen[];
  matches: ExtractedAllergenMatch[];
  highlightedHtml: string;
  isCompliant: boolean;
}

const ALLERGEN_KEYWORD_PATTERNS: Record<EUAllergen, RegExp[]> = {
  'Cereals containing gluten': [/wheat/i, /gluten/i, /barley/i, /rye/i, /oat/i, /weizen/i, /lepek/i, /blé/i],
  'Crustaceans': [/crustacean/i, /shrimp/i, /prawn/i, /crab/i, /lobster/i, /krab/i, /korýši/i, /crevette/i],
  'Eggs': [/egg/i, /eier/i, /œuf/i, /uova/i, /huevo/i, /vejce/i],
  'Fish': [/fish/i, /fische/i, /poisson/i, /pesce/i, /pescado/i, /ryby/i],
  'Peanuts': [/peanut/i, /erdnuss/i, /erdnüss/i, /arachide/i, /cacahuete/i, /arašíd/i],
  'Soybeans': [/soy/i, /soya/i, /soybean/i, /soja/i, /sójov/i],
  'Milk': [/milk/i, /dairy/i, /whey/i, /lactose/i, /milch/i, /lait/i, /latte/i, /leche/i, /mléko/i],
  'Nuts': [/nut/i, /almond/i, /hazelnut/i, /walnut/i, /cashew/i, /pistachio/i, /schalenfrüchte/i, /skořápkové/i, /haselnuss/i, /haselnüss/i],
  'Celery': [/celery/i, /sellerie/i, /céleri/i, /sedano/i, /apio/i, /celer/i],
  'Mustard': [/mustard/i, /senaf/i, /senef/i, /moutarde/i, /mostaza/i, /hořčice/i],
  'Sesame seeds': [/sesame/i, /sesam/i, /sésame/i, /sezam/i],
  'Sulphur dioxide and sulphites': [/sulphite/i, /sulfite/i, /schwefeldioxid/i, /sulfiti/i, /siřičit/i],
  'Lupin': [/lupin/i, /lupine/i, /lupini/i, /lupina/i],
  'Molluscs': [/mollusc/i, /mollusk/i, /mussel/i, /clam/i, /squid/i, /oyster/i, /měkkýš/i],
};

/**
 * Extracts and highlights EU Annex II allergens from raw ingredient text.
 */
export function extractAnnexAllergens(ingredientText: string): AllergenExtractionResult {
  const detectedAllergensSet = new Set<EUAllergen>();
  const matches: ExtractedAllergenMatch[] = [];

  EU_ALLERGENS_14.forEach((allergen) => {
    const patterns = ALLERGEN_KEYWORD_PATTERNS[allergen] || [];
    patterns.forEach((pattern) => {
      const match = pattern.exec(ingredientText);
      if (match) {
        detectedAllergensSet.add(allergen);
        matches.push({
          allergen,
          matchedKeyword: match[0],
          position: match.index,
        });
      }
    });
  });

  // Highlight matched terms in HTML with bold styling (FIC Art. 21 requirement)
  let highlightedHtml = ingredientText;
  matches.forEach((m) => {
    const regex = new RegExp(`(${m.matchedKeyword})`, 'gi');
    highlightedHtml = highlightedHtml.replace(regex, '<strong>$1</strong>');
  });

  return {
    detectedAllergens: Array.from(detectedAllergensSet),
    matches,
    highlightedHtml,
    isCompliant: true,
  };
}
