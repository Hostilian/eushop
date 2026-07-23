import { foodAPI, DEMO_FOOD_ITEMS } from '../lib/services/foodService';

describe('foodService', () => {
  it('returns all demonstration items when no query or country is specified', async () => {
    const result = await foodAPI.searchWithOrigin();
    expect(result.data.length).toBe(DEMO_FOOD_ITEMS.length);
  });

  it('filters products by country code', async () => {
    const result = await foodAPI.searchWithOrigin(undefined, 'IT');
    expect(result.data.every(item => item.countryCode === 'IT')).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
  });

  it('returns product by id', async () => {
    const product = await foodAPI.getById('food-002');
    expect(product.id).toBe('food-002');
    expect(product.name).toContain('Praline');
  });
});
