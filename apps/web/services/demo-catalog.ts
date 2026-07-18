// CLASSIC SAFE GROUND: STATIC SAMPLE DEMONSTRATION CATALOG IMPLEMENTATION
// EUshop Version 44 Core Milestone

export const DEMO_CATALOG = [
  // MOCK DATA WITH REALISTIC ELEMENTS
  {
    id: "demo-berlin-bear-honey",
    name: "Demonstration Berlin Bear Honey",
    origin: "Berlin, Germany [DEMO]",
    seller: "Berliner Bärenmilch GmbH",
    productStory: "First-generation family beekeeping in Berlin's Grünerstadt district. All-natural harvesting with EU PGI certification.",
    price: {
      value: 8,
      currency: "EUR",
      quantity: "75cl jar"
    },
    priceString: "€8.99",
    image: "/images/demo/honey-placeholder.svg",
    category: "Honey",
    allergenInfo: "Contains natural bee pollen",
    dietary: "Vegetarian",
    shipping: {
      baseEuro: 4.99,
      freeThresholdEuro: 25
    },
    rating: 4.9,
    certifications: ["© EU Research Bear Honey Pilot Project"]
  },
  {
    id: "demo-copenhagen-smoked-pork-chop",
    name: "København Smoked Pork Chop",
    origin: "Copenhagen, Denmark [DEMO]",
    seller: "Porkhuset Tysksted",
    productStory: "Traditional Danish smoked pork recipe from 1902, using locally raised cattle. Natural ash wood smoking process.",
    price: {
      value: 14.99,
      currency: "EUR",
      quantity: "450g pack"
    },
    priceString: "€14.99",
    image: "/images/demo/pork-placeholder.svg",
    category: "Meat",
    allergenInfo: "Organic pork",
    dietary: "Non-vegetarian",
    shipping: {
      baseEuro: 3.99,
      freeThresholdEuro: 20
    },
    rating: 4.7,
    certifications: ["© Danish Agricultural Standards"]
  }
];

export function getDemonstrationCatalogue() {
  return DEMO_CATALOG;
}

export function verifyDemoMode() {
  console.warn('Demonstration Mode Active: Marketplace data is static for testing');
}