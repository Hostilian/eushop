/**
 * EU Reg. 1169/2011 Article 30 Mandatory Nutrition Declaration Parser.
 * Single Source of Regulatory Truth for nutrition per 100g/100ml.
 */

export interface ParsedNutritionValues {
  energyKj?: number;
  energyKcal: number;
  fatG: number;
  saturatedFatG: number;
  carbohydrateG: number;
  sugarsG: number;
  proteinG: number;
  saltG: number;
  isComplete: boolean;
}

/**
 * Parses raw label OCR text and extracts FIC Art. 30 mandatory nutrition values per 100g.
 */
export function parseNutritionLabel(rawText: string): ParsedNutritionValues {
  const text = rawText.toLowerCase();

  const extractNumber = (patterns: RegExp[]): number => {
    for (const pattern of patterns) {
      const match = pattern.exec(text);
      if (match && match[1]) {
        const num = parseFloat(match[1].replace(',', '.'));
        if (!isNaN(num)) return num;
      }
    }
    return 0;
  };

  const energyKj = extractNumber([/(\d+(?:[.,]\d+)?)\s*kj/i, /brennwert.*?(\d+(?:[.,]\d+)?)\s*kj/i]);
  const energyKcal = extractNumber([/(\d+(?:[.,]\d+)?)\s*kcal/i, /energie.*?(\d+(?:[.,]\d+)?)\s*kcal/i]);
  const fatG = extractNumber([/fat.*?(\d+(?:[.,]\d+)?)\s*g/i, /fett.*?(\d+(?:[.,]\d+)?)\s*g/i, /matières grasses.*?(\d+(?:[.,]\d+)?)\s*g/i]);
  const saturatedFatG = extractNumber([/saturates.*?(\d+(?:[.,]\d+)?)\s*g/i, /gesättigte.*?(\d+(?:[.,]\d+)?)\s*g/i, /acides gras saturés.*?(\d+(?:[.,]\d+)?)\s*g/i]);
  const carbohydrateG = extractNumber([/carbohydrate.*?(\d+(?:[.,]\d+)?)\s*g/i, /kohlenhydrate.*?(\d+(?:[.,]\d+)?)\s*g/i, /glucides.*?(\d+(?:[.,]\d+)?)\s*g/i]);
  const sugarsG = extractNumber([/sugars.*?(\d+(?:[.,]\d+)?)\s*g/i, /zucker.*?(\d+(?:[.,]\d+)?)\s*g/i, /sucres.*?(\d+(?:[.,]\d+)?)\s*g/i]);
  const proteinG = extractNumber([/protein.*?(\d+(?:[.,]\d+)?)\s*g/i, /eiweiß.*?(\d+(?:[.,]\d+)?)\s*g/i, /protéines.*?(\d+(?:[.,]\d+)?)\s*g/i]);
  const saltG = extractNumber([/salt.*?(\d+(?:[.,]\d+)?)\s*g/i, /salz.*?(\d+(?:[.,]\d+)?)\s*g/i, /sel.*?(\d+(?:[.,]\d+)?)\s*g/i]);

  const isComplete = energyKcal > 0 && fatG >= 0 && carbohydrateG >= 0 && proteinG >= 0 && saltG >= 0;

  return {
    energyKj: energyKj || Math.round(energyKcal * 4.184),
    energyKcal,
    fatG,
    saturatedFatG,
    carbohydrateG,
    sugarsG,
    proteinG,
    saltG,
    isComplete,
  };
}
