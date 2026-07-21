import { parseNutritionLabel } from '../src/nutrition-parser';

describe('EU Reg. 1169/2011 Art. 30 Nutrition Label Parser (Task 74)', () => {
  it('parses English nutrition table correctly', () => {
    const text = 'NUTRITION DECLARATION Per 100g: Energy 2150 kJ / 514 kcal, Fat 28g, Saturates 16g, Carbohydrate 58g, Sugars 54g, Protein 6.8g, Salt 0.24g.';
    const result = parseNutritionLabel(text);

    expect(result.energyKcal).toBe(514);
    expect(result.fatG).toBe(28);
    expect(result.saturatedFatG).toBe(16);
    expect(result.carbohydrateG).toBe(58);
    expect(result.sugarsG).toBe(54);
    expect(result.proteinG).toBe(6.8);
    expect(result.saltG).toBe(0.24);
    expect(result.isComplete).toBe(true);
  });

  it('parses German Nährwertdeklaration table correctly', () => {
    const text = 'Nährwertangaben je 100g: Energie 1800 kJ / 430 kcal, Fett 14g, davon gesättigte Fettsäuren 8g, Kohlenhydrate 65g, davon Zucker 30g, Eiweiß 7.5g, Salz 0.5g.';
    const result = parseNutritionLabel(text);

    expect(result.energyKcal).toBe(430);
    expect(result.fatG).toBe(14);
    expect(result.saturatedFatG).toBe(8);
    expect(result.carbohydrateG).toBe(65);
    expect(result.sugarsG).toBe(30);
    expect(result.proteinG).toBe(7.5);
    expect(result.saltG).toBe(0.5);
    expect(result.isComplete).toBe(true);
  });
});
