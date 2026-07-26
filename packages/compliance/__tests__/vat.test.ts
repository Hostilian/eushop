import {
  calculateFoodVat,
  EU_FOOD_VAT_RATES,
  getFoodVatRate,
} from '../src/vat';

describe('EU food VAT single source of truth', () => {
  it('contains every EU member state rate exactly once', () => {
    expect(Object.keys(EU_FOOD_VAT_RATES)).toHaveLength(27);
    expect(EU_FOOD_VAT_RATES.DE).toBe(0.07);
    expect(EU_FOOD_VAT_RATES.FR).toBe(0.055);
  });

  it('normalizes destination country codes before lookup', () => {
    expect(getFoodVatRate('cz')).toBe(0.12);
  });

  it('rounds calculated VAT and gross amounts to cents', () => {
    expect(calculateFoodVat(19.99, 'DE')).toEqual({
      rate: 0.07,
      vatAmountEur: 1.4,
      grossAmountEur: 21.39,
    });
  });

  it('uses the documented conservative fallback for an unknown country', () => {
    expect(getFoodVatRate('XX')).toBe(0.2);
  });
});
