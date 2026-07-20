import type { EUAllergen } from '@eushop/compliance';

export interface NutritionDeclaration {
  energyKj: number;
  energyKcal: number;
  fatG: number;
  saturatedFatG: number;
  carbohydrateG: number;
  sugarsG: number;
  proteinG: number;
  saltG: number;
}

export interface FoodBusinessOperator {
  name: string;
  address: string;
}

export interface FoodItem {
  id: string;
  name: string;
  country: string;
  countryIso2?: string;
  price: number;
  description: string;
  imageUrl?: string;
  sellerId: string;
  finderFee?: number;
  category?: string;
  dietaryRestrictions?: string[];
  allergens?: EUAllergen[];
  images?: string[];
  ingredients?: string;
  netQuantity?: string;
  storageInstructions?: string;
  instructionsForUse?: string;
  originStatement?: string;
  durabilityInformation?: string;
  foodBusinessOperator?: FoodBusinessOperator;
  nutritionPer100g?: NutritionDeclaration;
  isPrepacked?: boolean;
  isDemo?: boolean;
  informationStatus?: 'illustrative-unverified';
  qualityScheme?: 'PDO' | 'PGI' | 'TSG';
  qualitySchemeVerified?: boolean;
  seller?: {
    id: string;
    name: string;
    rating: number;
    verified: boolean;
  };
}

export interface DemoProduct extends FoodItem {
  countryIso2: string;
  category: string;
  allergens: EUAllergen[];
  ingredients: string;
  netQuantity: string;
  storageInstructions: string;
  instructionsForUse: string;
  originStatement: string;
  durabilityInformation: string;
  foodBusinessOperator: FoodBusinessOperator;
  nutritionPer100g: NutritionDeclaration;
  isPrepacked: true;
  isDemo: true;
  informationStatus: 'illustrative-unverified';
}

const demoSeller = (country: string, city: string, id: string) => ({
  id,
  name: `EUshop demonstration seller — ${country}`,
  rating: 0,
  verified: false,
  operator: {
    name: `EUshop demonstration food operator — ${country}`,
    address: `Illustrative ${city} address — not a real trader or dispatch location`,
  },
});

const belgium = demoSeller('Belgium', 'Brussels', 'demo-seller-be');
const czechia = demoSeller('Czechia', 'Karlovy Vary', 'demo-seller-cz');
const italy = demoSeller('Italy', 'Bronte', 'demo-seller-it');
const spain = demoSeller('Spain', 'Plasencia', 'demo-seller-es');
const france = demoSeller('France', 'Provence', 'demo-seller-fr');
const germany = demoSeller('Germany', 'Lübeck', 'demo-seller-de');
const greece = demoSeller('Greece', 'Thessaly', 'demo-seller-gr');
const poland = demoSeller('Poland', 'Toruń', 'demo-seller-pl');
const portugal = demoSeller('Portugal', 'Matosinhos', 'demo-seller-pt');
const austria = demoSeller('Austria', 'Graz', 'demo-seller-at');
const netherlands = demoSeller('Netherlands', 'Gouda', 'demo-seller-nl');
const sweden = demoSeller('Sweden', 'Dalarna', 'demo-seller-se');

/**
 * Bundled, fictional catalogue used only when live marketplace data is not
 * available. Recipe and nutrition values are illustrative label data, not
 * verified offers, laboratory results, origin proofs, or compliance claims.
 *
 * COMPLIANCE-REVIEW: Article 14/Article 9 fields are represented so the UI can
 * exercise the required pre-purchase disclosure structure. A food business
 * operator must verify every value, applicable exception, language, QUID and
 * category-specific requirement before any record can become a live listing.
 * Source reviewed: consolidated Regulation (EU) No 1169/2011 (2025-04-01).
 */
export const DEMO_PRODUCTS: readonly DemoProduct[] = [
  {
    id: 'demo-belgian-pralines',
    name: 'Belgian Hazelnut Pralines',
    country: 'Belgium',
    countryIso2: 'BE',
    price: 18.9,
    description: 'An illustrative assortment of dark and milk chocolate shells with hazelnut praline centres.',
    imageUrl: '/images/belgian_chocolates.png',
    images: ['/images/belgian_chocolates.png'],
    sellerId: belgium.id,
    seller: belgium,
    category: 'Chocolate',
    dietaryRestrictions: ['Vegetarian'],
    allergens: ['Milk', 'Soybeans', 'Nuts'],
    ingredients: 'Sugar, cocoa mass, HAZELNUTS (18%), cocoa butter, MILK powder, emulsifier: SOY lecithin, vanilla extract.',
    netQuantity: '200 g',
    storageInstructions: 'Store in a cool, dry place away from direct sunlight.',
    instructionsForUse: 'Ready to eat.',
    originStatement: 'Illustrative place of provenance: Belgium. Origin evidence has not been verified. — Demonstration catalogue',
    durabilityInformation: 'A batch-specific best-before date must appear on the package at delivery.',
    foodBusinessOperator: belgium.operator,
    nutritionPer100g: { energyKj: 2260, energyKcal: 541, fatG: 34, saturatedFatG: 17, carbohydrateG: 50, sugarsG: 46, proteinG: 7.2, saltG: 0.12 },
    isPrepacked: true,
    isDemo: true,
    informationStatus: 'illustrative-unverified',
  },
  {
    id: 'demo-czech-spa-wafers',
    name: 'Czech Spa Wafers',
    country: 'Czechia',
    countryIso2: 'CZ',
    price: 7.4,
    description: 'Thin, round Karlovy Vary-style wafers with a cocoa and hazelnut filling.',
    sellerId: czechia.id,
    seller: czechia,
    category: 'Biscuit',
    dietaryRestrictions: ['Vegetarian'],
    allergens: ['Cereals containing gluten', 'Milk', 'Soybeans', 'Nuts'],
    ingredients: 'WHEAT flour, sugar, vegetable fat, HAZELNUTS (7%), cocoa powder, MILK powder, emulsifier: SOY lecithin, cinnamon, salt.',
    netQuantity: '150 g',
    storageInstructions: 'Keep dry and protect from heat.',
    instructionsForUse: 'Ready to eat; separate the fragile wafers carefully.',
    originStatement: 'Illustrative place of provenance: Karlovy Vary region, Czechia. Origin evidence has not been verified. — Demonstration catalogue',
    durabilityInformation: 'A batch-specific best-before date must appear on the package at delivery.',
    foodBusinessOperator: czechia.operator,
    nutritionPer100g: { energyKj: 2010, energyKcal: 480, fatG: 20, saturatedFatG: 9.5, carbohydrateG: 68, sugarsG: 34, proteinG: 6.5, saltG: 0.3 },
    isPrepacked: true,
    isDemo: true,
    informationStatus: 'illustrative-unverified',
  },
  {
    id: 'demo-italian-pistachio-cream',
    name: 'Italian Pistachio Cream',
    country: 'Italy',
    countryIso2: 'IT',
    price: 13.6,
    description: 'A smooth, sweet pistachio spread inspired by Sicilian pastry traditions.',
    sellerId: italy.id,
    seller: italy,
    category: 'Spread',
    dietaryRestrictions: ['Vegetarian'],
    allergens: ['Milk', 'Soybeans', 'Nuts'],
    ingredients: 'PISTACHIOS (35%), sugar, vegetable oil, skimmed MILK powder, cocoa butter, emulsifier: SOY lecithin, salt.',
    netQuantity: '190 g',
    storageInstructions: 'Store in a cool, dry place. Refrigerate after opening and use within 30 days.',
    instructionsForUse: 'Stir before use. Suitable as a spread or pastry filling.',
    originStatement: 'Illustrative place of provenance: Sicily, Italy. Pistachio and processing origin require documentary verification. — Demonstration catalogue',
    durabilityInformation: 'A batch-specific best-before date must appear on the jar at delivery.',
    foodBusinessOperator: italy.operator,
    nutritionPer100g: { energyKj: 2420, energyKcal: 581, fatG: 40, saturatedFatG: 9, carbohydrateG: 45, sugarsG: 39, proteinG: 11, saltG: 0.18 },
    isPrepacked: true,
    isDemo: true,
    informationStatus: 'illustrative-unverified',
  },
  {
    id: 'demo-spanish-smoked-paprika',
    name: 'Spanish Smoked Paprika',
    country: 'Spain',
    countryIso2: 'ES',
    price: 6.2,
    description: 'A sweet, oak-smoked red pepper powder inspired by western Spanish seasoning traditions.',
    sellerId: spain.id,
    seller: spain,
    category: 'Spice',
    dietaryRestrictions: ['Vegan'],
    allergens: [],
    ingredients: 'Smoked red pepper powder (100%).',
    netQuantity: '75 g',
    storageInstructions: 'Keep tightly closed in a cool, dry place away from light.',
    instructionsForUse: 'Use as a seasoning; do not inhale the powder.',
    originStatement: 'Illustrative place of provenance: Extremadura, Spain. No protected designation is asserted. — Demonstration catalogue',
    durabilityInformation: 'A batch-specific best-before date must appear on the tin at delivery.',
    foodBusinessOperator: spain.operator,
    nutritionPer100g: { energyKj: 1190, energyKcal: 285, fatG: 13, saturatedFatG: 2.1, carbohydrateG: 19, sugarsG: 10, proteinG: 14, saltG: 0.17 },
    isPrepacked: true,
    isDemo: true,
    informationStatus: 'illustrative-unverified',
  },
  {
    id: 'demo-french-apricot-preserve',
    name: 'French Apricot Preserve',
    country: 'France',
    countryIso2: 'FR',
    price: 8.8,
    description: 'A fruit-forward apricot preserve inspired by Provençal breakfast tables.',
    sellerId: france.id,
    seller: france,
    category: 'Preserve',
    dietaryRestrictions: ['Vegan'],
    allergens: [],
    ingredients: 'Apricots (62%), sugar, lemon juice, gelling agent: fruit pectin.',
    netQuantity: '320 g',
    storageInstructions: 'Refrigerate after opening and consume within 21 days.',
    instructionsForUse: 'Ready to eat. Use a clean spoon after opening.',
    originStatement: 'Illustrative place of provenance: Provence, France. Fruit origin evidence has not been verified. — Demonstration catalogue',
    durabilityInformation: 'A batch-specific best-before date must appear on the jar at delivery.',
    foodBusinessOperator: france.operator,
    nutritionPer100g: { energyKj: 1040, energyKcal: 245, fatG: 0.2, saturatedFatG: 0, carbohydrateG: 59, sugarsG: 56, proteinG: 0.6, saltG: 0.02 },
    isPrepacked: true,
    isDemo: true,
    informationStatus: 'illustrative-unverified',
  },
  {
    id: 'demo-german-marzipan',
    name: 'German Marzipan Bites',
    country: 'Germany',
    countryIso2: 'DE',
    price: 10.5,
    description: 'Lübeck-style marzipan pieces coated in dark chocolate, without a protected-origin claim.',
    imageUrl: '/images/german_delicatessen.png',
    images: ['/images/german_delicatessen.png'],
    sellerId: germany.id,
    seller: germany,
    category: 'Confectionery',
    dietaryRestrictions: ['Vegetarian'],
    allergens: ['Soybeans', 'Nuts'],
    ingredients: 'ALMONDS (46%), sugar, cocoa mass, cocoa butter, glucose syrup, emulsifier: SOY lecithin, natural flavouring.',
    netQuantity: '125 g',
    storageInstructions: 'Store below 20°C in a dry place.',
    instructionsForUse: 'Ready to eat.',
    originStatement: 'Illustrative place of provenance: Lübeck, Germany. No PGI/PDO/TSG status is asserted. — Demonstration catalogue',
    durabilityInformation: 'A batch-specific best-before date must appear on the package at delivery.',
    foodBusinessOperator: germany.operator,
    nutritionPer100g: { energyKj: 2050, energyKcal: 490, fatG: 27, saturatedFatG: 7.5, carbohydrateG: 50, sugarsG: 47, proteinG: 9.5, saltG: 0.03 },
    isPrepacked: true,
    isDemo: true,
    informationStatus: 'illustrative-unverified',
  },
  {
    id: 'demo-greek-mountain-honey',
    name: 'Greek Mountain Honey',
    country: 'Greece',
    countryIso2: 'GR',
    price: 12.2,
    description: 'An illustrative thyme and wildflower honey blend associated with Greek mountain apiaries.',
    sellerId: greece.id,
    seller: greece,
    category: 'Honey',
    dietaryRestrictions: ['Vegetarian'],
    allergens: [],
    ingredients: 'Honey (100%).',
    netQuantity: '400 g',
    storageInstructions: 'Store at room temperature. Natural crystallisation may occur.',
    instructionsForUse: 'Not suitable for infants under 12 months.',
    originStatement: 'Illustrative country of origin: Greece. Apiary and harvest evidence has not been verified. — Demonstration catalogue',
    durabilityInformation: 'A batch-specific best-before date must appear on the jar at delivery.',
    foodBusinessOperator: greece.operator,
    nutritionPer100g: { energyKj: 1280, energyKcal: 302, fatG: 0, saturatedFatG: 0, carbohydrateG: 75.5, sugarsG: 75.1, proteinG: 0.4, saltG: 0.01 },
    isPrepacked: true,
    isDemo: true,
    informationStatus: 'illustrative-unverified',
  },
  {
    id: 'demo-polish-pierniki',
    name: 'Polish Pierniki',
    country: 'Poland',
    countryIso2: 'PL',
    price: 9.3,
    description: 'Spiced Toruń-style gingerbread biscuits with a thin cocoa glaze.',
    sellerId: poland.id,
    seller: poland,
    category: 'Biscuit',
    dietaryRestrictions: ['Vegetarian'],
    allergens: ['Cereals containing gluten', 'Eggs', 'Soybeans'],
    ingredients: 'WHEAT flour, sugar, honey, EGG, cocoa glaze (sugar, cocoa mass, cocoa butter, emulsifier: SOY lecithin), cinnamon, ginger, cloves, raising agent: sodium bicarbonate.',
    netQuantity: '180 g',
    storageInstructions: 'Store sealed in a cool, dry place.',
    instructionsForUse: 'Ready to eat.',
    originStatement: 'Illustrative place of provenance: Toruń, Poland. No protected designation is asserted. — Demonstration catalogue',
    durabilityInformation: 'A batch-specific best-before date must appear on the package at delivery.',
    foodBusinessOperator: poland.operator,
    nutritionPer100g: { energyKj: 1650, energyKcal: 392, fatG: 9.2, saturatedFatG: 4.5, carbohydrateG: 70, sugarsG: 38, proteinG: 6.2, saltG: 0.42 },
    isPrepacked: true,
    isDemo: true,
    informationStatus: 'illustrative-unverified',
  },
  {
    id: 'demo-portuguese-sardines',
    name: 'Portuguese Sardines in Olive Oil',
    country: 'Portugal',
    countryIso2: 'PT',
    price: 6.9,
    description: 'Whole sardines packed in olive oil in the style of northern Portuguese canneries.',
    sellerId: portugal.id,
    seller: portugal,
    category: 'Preserved fish',
    dietaryRestrictions: [],
    allergens: ['Fish'],
    ingredients: 'SARDINES (Sardina pilchardus) (70%), olive oil (29%), salt.',
    netQuantity: '120 g (drained weight 84 g)',
    storageInstructions: 'Store at room temperature. After opening, refrigerate in a non-metallic container and consume within 2 days.',
    instructionsForUse: 'Ready to eat. Open the can carefully; small bones may be present.',
    originStatement: 'Illustrative production origin: Portugal. Catch area and fishing-gear particulars require batch verification. — Demonstration catalogue',
    durabilityInformation: 'A batch-specific best-before date and lot code must appear on the can at delivery.',
    foodBusinessOperator: portugal.operator,
    nutritionPer100g: { energyKj: 850, energyKcal: 204, fatG: 13, saturatedFatG: 2.8, carbohydrateG: 0, sugarsG: 0, proteinG: 22, saltG: 1.1 },
    isPrepacked: true,
    isDemo: true,
    informationStatus: 'illustrative-unverified',
  },
  {
    id: 'demo-austrian-pumpkin-seed-oil',
    name: 'Austrian Pumpkin Seed Oil',
    country: 'Austria',
    countryIso2: 'AT',
    price: 15.7,
    description: 'A dark, nutty roasted pumpkin seed oil inspired by Styrian culinary traditions.',
    imageUrl: '/images/italian_olive_oil.png',
    images: ['/images/italian_olive_oil.png'],
    sellerId: austria.id,
    seller: austria,
    category: 'Oil',
    dietaryRestrictions: ['Vegan'],
    allergens: [],
    ingredients: 'Roasted pumpkin seed oil (100%).',
    netQuantity: '250 ml',
    storageInstructions: 'Protect from light and heat. Close firmly after use.',
    instructionsForUse: 'Use cold as a dressing or finishing oil; not intended for high-temperature frying.',
    originStatement: 'Illustrative place of provenance: Styria, Austria. No PGI/PDO/TSG status is asserted. — Demonstration catalogue',
    durabilityInformation: 'A batch-specific best-before date must appear on the bottle at delivery.',
    foodBusinessOperator: austria.operator,
    nutritionPer100g: { energyKj: 3404, energyKcal: 828, fatG: 92, saturatedFatG: 18, carbohydrateG: 0, sugarsG: 0, proteinG: 0, saltG: 0 },
    isPrepacked: true,
    isDemo: true,
    informationStatus: 'illustrative-unverified',
  },
  {
    id: 'demo-dutch-aged-cheese',
    name: 'Dutch Aged Gouda-Style Cheese',
    country: 'Netherlands',
    countryIso2: 'NL',
    price: 11.8,
    description: 'A firm, matured cow’s-milk cheese with caramel notes and natural protein crystals.',
    imageUrl: '/images/spanish_manchego.png',
    images: ['/images/spanish_manchego.png'],
    sellerId: netherlands.id,
    seller: netherlands,
    category: 'Cheese',
    dietaryRestrictions: ['Vegetarian'],
    allergens: ['Milk'],
    ingredients: 'Pasteurised cow’s MILK, salt, starter cultures, microbial rennet, preservative: sodium nitrate, colour: annatto.',
    netQuantity: '300 g',
    storageInstructions: 'Keep refrigerated at 2–7°C. Wrap after opening and consume within 7 days.',
    instructionsForUse: 'Remove from refrigeration shortly before serving.',
    originStatement: 'Illustrative country of origin: Netherlands. Milk and processing origin require verification. — Demonstration catalogue',
    durabilityInformation: 'A batch-specific use-by or best-before date must appear on the package at delivery.',
    foodBusinessOperator: netherlands.operator,
    nutritionPer100g: { energyKj: 1690, energyKcal: 407, fatG: 33, saturatedFatG: 22, carbohydrateG: 0.1, sugarsG: 0.1, proteinG: 27, saltG: 1.8 },
    isPrepacked: true,
    isDemo: true,
    informationStatus: 'illustrative-unverified',
  },
  {
    id: 'demo-swedish-crispbread',
    name: 'Swedish Rye Crispbread',
    country: 'Sweden',
    countryIso2: 'SE',
    price: 5.6,
    description: 'A dry, round wholegrain rye crispbread inspired by central Swedish baking.',
    sellerId: sweden.id,
    seller: sweden,
    category: 'Bread',
    dietaryRestrictions: ['Vegan'],
    allergens: ['Cereals containing gluten', 'Sesame seeds'],
    ingredients: 'Wholegrain RYE flour (84%), water, SESAME seeds (6%), yeast, salt.',
    netQuantity: '250 g',
    storageInstructions: 'Keep sealed and dry. Protect from strong odours.',
    instructionsForUse: 'Ready to eat.',
    originStatement: 'Illustrative place of provenance: Dalarna, Sweden. Origin evidence has not been verified. — Demonstration catalogue',
    durabilityInformation: 'A batch-specific best-before date must appear on the package at delivery.',
    foodBusinessOperator: sweden.operator,
    nutritionPer100g: { energyKj: 1460, energyKcal: 346, fatG: 6.8, saturatedFatG: 1, carbohydrateG: 58, sugarsG: 2.2, proteinG: 10.5, saltG: 1.2 },
    isPrepacked: true,
    isDemo: true,
    informationStatus: 'illustrative-unverified',
  },
];
