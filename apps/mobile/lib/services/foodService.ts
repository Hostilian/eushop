import type { EUAllergen } from '@eushop/compliance';

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  price: number;
  country: string;
  countryCode: string;
  origin: string;
  allergens: EUAllergen[];
  sellerName: string;
  traderType: string;
  sellerVatId?: string;
  description: string;
  image: string;
  dopIgp?: 'DOP' | 'IGP' | 'STG' | null;
}

export const DEMO_FOOD_ITEMS: FoodItem[] = [
  {
    id: 'food-001',
    name: 'Parchment Flatbread (Pane Carasau)',
    category: 'Bakery',
    price: 6.50,
    country: 'Italy',
    countryCode: 'IT',
    origin: 'Nuoro, Sardinia, Italy',
    allergens: ['Cereals containing gluten'],
    sellerName: 'Panificio Sa Odissea SAS',
    traderType: 'Trader (DSA Art. 30 Verified)',
    sellerVatId: 'IT09876543210',
    description: 'Traditional Sardinian crisp flatbread baked twice in wood-fired ovens.',
    image: '/images/italian_olive_oil.png',
    dopIgp: 'DOP'
  },
  {
    id: 'food-002',
    name: 'Artisanal Praline Selection',
    category: 'Confectionery',
    price: 18.90,
    country: 'Belgium',
    countryCode: 'BE',
    origin: 'Bruges, Flanders, Belgium',
    allergens: ['Milk', 'Nuts', 'Soybeans'],
    sellerName: 'Chocolaterie Van Der Berg BV',
    traderType: 'Trader (DSA Art. 30 Verified)',
    sellerVatId: 'BE0123456789',
    description: 'Handcrafted Belgian dark and milk chocolate pralines with hazelnut gianduja.',
    image: '/images/belgian_chocolates.png',
    dopIgp: null
  },
  {
    id: 'food-003',
    name: 'Aged Manchego Cheese (Curado 12m)',
    category: 'Dairy',
    price: 14.20,
    country: 'Spain',
    countryCode: 'ES',
    origin: 'La Mancha, Spain',
    allergens: ['Milk', 'Eggs'],
    sellerName: 'Quesería Valle de la Mancha SL',
    traderType: 'Trader (DSA Art. 30 Verified)',
    sellerVatId: 'ESB98765432',
    description: 'Authentic 12-month aged Manchego PDO sheep milk cheese.',
    image: '/images/spanish_manchego.png',
    dopIgp: 'DOP'
  },
  {
    id: 'food-004',
    name: 'Black Forest Ham (Schwarzwälder Schinken)',
    category: 'Charcuterie',
    price: 11.80,
    country: 'Germany',
    countryCode: 'DE',
    origin: 'Black Forest, Baden-Württemberg, Germany',
    allergens: [],
    sellerName: 'Schwarzwald Metzgerei GmbH',
    traderType: 'Trader (DSA Art. 30 Verified)',
    sellerVatId: 'DE811223344',
    description: 'Dry-cured and smoked Black Forest ham with IGP geographical protection.',
    image: '/images/german_delicatessen.png',
    dopIgp: 'IGP'
  }
];

export const foodAPI = {
  searchWithOrigin: async (query?: string, country?: string, page = 1, limit = 50) => {
    let results = [...DEMO_FOOD_ITEMS];
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(item => item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q));
    }
    if (country) {
      results = results.filter(item => item.countryCode.toLowerCase() === country.toLowerCase() || item.country.toLowerCase() === country.toLowerCase());
    }
    return {
      data: results,
      total: results.length,
      page,
      limit
    };
  },

  getById: async (id: string) => {
    return DEMO_FOOD_ITEMS.find(item => item.id === id) || DEMO_FOOD_ITEMS[0];
  },

  getTrendingWithOrigin: async () => {
    return DEMO_FOOD_ITEMS;
  }
};
