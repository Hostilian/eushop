import {
  extractAnnexAllergens,
  parseNutritionLabel,
  verifyQualitySchemeClaim,
  checkFicArticle15LanguageCompliance,
} from '../src/index';

describe('Vision AI & Compliance Pipeline End-to-End Test (Task 78)', () => {
  it('runs complete multi-stage OCR compliance check on food product label data', () => {
    const rawLabelText = 'Zutaten: Weizenmehl, Butter (Milch), Eier. Nährwertangaben je 100g: Energie 1800 kJ / 430 kcal, Fett 14g, Salz 0.5g.';

    // 1. Allergen Extraction
    const allergens = extractAnnexAllergens(rawLabelText);
    expect(allergens.detectedAllergens).toContain('Cereals containing gluten');
    expect(allergens.detectedAllergens).toContain('Milk');
    expect(allergens.detectedAllergens).toContain('Eggs');

    // 2. Nutrition Table Parsing
    const nutrition = parseNutritionLabel(rawLabelText);
    expect(nutrition.energyKcal).toBe(430);
    expect(nutrition.fatG).toBe(14);
    expect(nutrition.saltG).toBe(0.5);

    // 3. Quality Scheme Verification
    const qualityScheme = verifyQualitySchemeClaim('Prosciutto di Parma');
    expect(qualityScheme.isVerified).toBe(true);

    // 4. FIC Art. 15 Language Compliance
    const langCheck = checkFicArticle15LanguageCompliance('DE', ['de']);
    expect(langCheck.isCompliant).toBe(true);
  });
});
