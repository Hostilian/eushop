import { getAllergenTranslation, EU_ALLERGENS_14, ALLERGEN_I18N } from '../src/allergens';

describe('EU Annex II Allergen i18n Translation Engine (Task 64)', () => {
  it('contains official translations for all 14 EU allergens across 6 languages', () => {
    EU_ALLERGENS_14.forEach((allergen) => {
      expect(ALLERGEN_I18N[allergen]).toBeDefined();
      expect(ALLERGEN_I18N[allergen].en).toBeTruthy();
      expect(ALLERGEN_I18N[allergen].de).toBeTruthy();
      expect(ALLERGEN_I18N[allergen].fr).toBeTruthy();
      expect(ALLERGEN_I18N[allergen].it).toBeTruthy();
      expect(ALLERGEN_I18N[allergen].es).toBeTruthy();
      expect(ALLERGEN_I18N[allergen].cs).toBeTruthy();
    });
  });

  it('translates Milk correctly across languages', () => {
    expect(getAllergenTranslation('Milk', 'de')).toBe('Milch');
    expect(getAllergenTranslation('Milk', 'fr')).toBe('Lait');
    expect(getAllergenTranslation('Milk', 'cs')).toBe('Mléko');
  });

  it('falls back to English when language is not supplied', () => {
    expect(getAllergenTranslation('Peanuts')).toBe('Peanuts');
  });
});
