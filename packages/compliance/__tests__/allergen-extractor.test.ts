import { extractAnnexAllergens } from '../src/allergen-extractor';

describe('EU Annex II Allergen Auto-Extraction & Highlighting Engine (Task 73)', () => {
  it('detects Wheat, Milk, and Eggs in English ingredient text', () => {
    const text = 'Ingredients: Wheat flour, sugar, butter (milk), fresh eggs, salt.';
    const result = extractAnnexAllergens(text);

    expect(result.detectedAllergens).toContain('Cereals containing gluten');
    expect(result.detectedAllergens).toContain('Milk');
    expect(result.detectedAllergens).toContain('Eggs');
    expect(result.highlightedHtml).toContain('<strong>Wheat</strong>');
    expect(result.highlightedHtml).toContain('<strong>milk</strong>');
  });

  it('detects German allergen keywords (Weizen, Milch, Eier)', () => {
    const text = 'Zutaten: Weizenmehl, Milch, Eier, Haselnuss.';
    const result = extractAnnexAllergens(text);

    expect(result.detectedAllergens).toContain('Cereals containing gluten');
    expect(result.detectedAllergens).toContain('Milk');
    expect(result.detectedAllergens).toContain('Eggs');
    expect(result.detectedAllergens).toContain('Nuts');
  });
});
