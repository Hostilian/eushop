import { EU_ALLERGENS_14 } from '@eushop/compliance';
import { DEMO_PRODUCTS } from '../data/demo-products';
import {
  findDemonstrationProduct,
  getDemonstrationCatalogue,
  searchDemonstrationCatalogue,
} from '../services/demo-catalog';

describe('bundled demonstration catalogue', () => {
  it('contains 12 unique regional foods with structured distance-selling information', () => {
    expect(DEMO_PRODUCTS).toHaveLength(12);
    expect(new Set(DEMO_PRODUCTS.map(product => product.id))).toHaveProperty('size', 12);
    expect(DEMO_PRODUCTS.map(product => product.name)).toEqual(expect.arrayContaining([
      'Belgian Hazelnut Pralines',
      'Czech Spa Wafers',
      'Italian Pistachio Cream',
      'Spanish Smoked Paprika',
      'French Apricot Preserve',
      'German Marzipan Bites',
      'Greek Mountain Honey',
      'Polish Pierniki',
      'Portuguese Sardines in Olive Oil',
      'Austrian Pumpkin Seed Oil',
    ]));

    for (const product of DEMO_PRODUCTS) {
      expect(product).toEqual(expect.objectContaining({
        isPrepacked: true,
        isDemo: true,
        informationStatus: 'illustrative-unverified',
      }));
      expect(product.ingredients).toBeTruthy();
      expect(product.netQuantity).toBeTruthy();
      expect(product.storageInstructions).toBeTruthy();
      expect(product.instructionsForUse).toBeTruthy();
      expect(product.originStatement).toMatch(/Illustrative/i);
      expect(product.durabilityInformation).toBeTruthy();
      expect(product.foodBusinessOperator.name).toMatch(/demonstration/i);
      expect(product.foodBusinessOperator.address).toMatch(/not a real trader/i);
      expect(product.seller?.verified).toBe(false);
      expect(product.nutritionPer100g.energyKj).toBeGreaterThanOrEqual(0);
      expect(product.nutritionPer100g.energyKcal).toBeGreaterThanOrEqual(0);
      expect(product.allergens.every(allergen => EU_ALLERGENS_14.includes(allergen))).toBe(true);
    }
  });

  it('filters without mutating the bundled source', () => {
    const result = searchDemonstrationCatalogue({
      query: 'style',
      country: 'Germany',
      allergenFree: 'Milk',
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('demo-german-marzipan');
    expect(result[0]).not.toBe(DEMO_PRODUCTS[5]);
    expect(getDemonstrationCatalogue()).toHaveLength(12);
  });

  it('returns a copy for product-detail fallback lookup', () => {
    const result = findDemonstrationProduct('demo-portuguese-sardines');

    expect(result?.allergens).toEqual(['Fish']);
    expect(result).not.toBe(DEMO_PRODUCTS[8]);
    expect(findDemonstrationProduct('missing')).toBeUndefined();
  });
});
