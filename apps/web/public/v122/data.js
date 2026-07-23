/**
 * EUshop v122 Enterprise Master Dataset
 * Authenticated specialty food listings across EU member states with mandatory compliance metadata:
 * - 14 EU Regulated Allergens (Reg. 1169/2011)
 * - PDO/PGI Geographic Certifications
 * - DSA Art. 30 Verified Trader Identity & DAC7 Tax Compliance
 */
const EUSHOP_DATA = {
  version: "v122",
  brand: "EUshop Enterprise",
  tagline: "The Sovereign Cross-Border Specialty Food Marketplace of Europe",
  stats: {
    verifiedSellers: "1,420+",
    euCountries: 27,
    activeProducts: "18,900+",
    annualVatReconciled: "€14.2M"
  },
  categories: [
    { id: "cheese", name: "Artisanal Cheeses & Dairy", icon: "🧀", count: 4820 },
    { id: "charcuterie", name: "Cured Meats & Salumi", icon: "🥩", count: 3210 },
    { id: "olive-oil", name: "Extra Virgin Olive Oils", icon: "🫒", count: 2940 },
    { id: "wine", name: "Organic & Heritage Wines", icon: "🍷", count: 4150 },
    { id: "pantry", name: "Preserves, Honey & Spices", icon: "🍯", count: 3780 }
  ],
  allergensList: [
    "Gluten", "Crustaceans", "Eggs", "Fish", "Peanuts", "Soybeans",
    "Milk", "Nuts", "Celery", "Mustard", "Sesame", "Sulphites", "Lupin", "Molluscs"
  ],
  featuredProducts: [
    {
      id: "prod-101",
      name: "Parmigiano Reggiano DOP (36 Months Aged)",
      origin: "Italy (Reggio Emilia)",
      flag: "🇮🇹",
      category: "cheese",
      price: 34.50,
      unit: "per 1 kg wheel section",
      rating: 4.98,
      reviewsCount: 342,
      certifications: ["PDO (DOP)", "Organic", "Raw Milk"],
      allergens: ["Milk"],
      seller: {
        id: "seller-it-01",
        name: "Azienda Agricola Bio Parma",
        vetted: true,
        dsaVerified: true,
        vatRegistered: true,
        vatNumber: "IT01928374651",
        traderRegistration: "PR-204192",
        dac7Compliant: true,
        country: "Italy"
      },
      image: "https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=800&q=80",
      description: "Handcrafted 36-month vacuum-aged Parmigiano Reggiano DOP. Produced exclusively with unpasteurized milk from local Vacche Rosse herds.",
      nutrition: { calories: "392 kcal", protein: "33g", fat: "28g", salt: "1.6g" }
    },
    {
      id: "prod-102",
      name: "Jamón Ibérico de Bellota 100% Pata Negra",
      origin: "Spain (Jabugo)",
      flag: "🇪🇸",
      category: "charcuterie",
      price: 89.00,
      unit: "per 500g hand-carved pack",
      rating: 5.00,
      reviewsCount: 512,
      certifications: ["PGI (IGP)", "Acorn-Fed", "Free-Range"],
      allergens: [],
      seller: {
        id: "seller-es-04",
        name: "Dehesa de Jabugo S.L.",
        vetted: true,
        dsaVerified: true,
        vatRegistered: true,
        vatNumber: "ESB91827364",
        traderRegistration: "HU-98124",
        dac7Compliant: true,
        country: "Spain"
      },
      image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
      description: "100% Pure Iberian Bellota Ham, cured for 48 months in natural cellars of Sierra de Aracena. Rich in oleic acid with delicate marbling.",
      nutrition: { calories: "375 kcal", protein: "30g", fat: "27g", salt: "2.1g" }
    },
    {
      id: "prod-103",
      name: "Kalamata EVOO PDO Unfiltered Cold Pressed",
      origin: "Greece (Messinia)",
      flag: "🇬🇷",
      category: "olive-oil",
      price: 18.20,
      unit: "per 750ml dark glass bottle",
      rating: 4.95,
      reviewsCount: 219,
      certifications: ["PDO (POP)", "First Cold Press", "Polyphenol Rich"],
      allergens: [],
      seller: {
        id: "seller-gr-09",
        name: "Messinian Groves Estate",
        vetted: true,
        dsaVerified: true,
        vatRegistered: true,
        vatNumber: "EL098234112",
        traderRegistration: "M-40192",
        dac7Compliant: true,
        country: "Greece"
      },
      image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80",
      description: "Single-estate extra virgin olive oil harvested from centuries-old Koroneiki trees in Kalamata. Acidity < 0.2%.",
      nutrition: { calories: "824 kcal", protein: "0g", fat: "91.6g", salt: "0g" }
    },
    {
      id: "prod-104",
      name: "Châteauneuf-du-Pape AOC Rouge 2019",
      origin: "France (Rhône Valley)",
      flag: "🇫🇷",
      category: "wine",
      price: 52.00,
      unit: "per 750ml bottle",
      rating: 4.92,
      reviewsCount: 184,
      certifications: ["AOC / AOP", "Biodynamic", "Low Sulphites"],
      allergens: ["Sulphites"],
      seller: {
        id: "seller-fr-12",
        name: "Domaine de la Solitude Bio",
        vetted: true,
        dsaVerified: true,
        vatRegistered: true,
        vatNumber: "FR8291029381",
        traderRegistration: "RCS-82910",
        dac7Compliant: true,
        country: "France"
      },
      image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80",
      description: "Grenache-dominant biodynamic blend aged in oak foudres. Notes of dark cherries, garrigue herbs, and crushed black pepper.",
      nutrition: { calories: "85 kcal", protein: "0.1g", fat: "0g", salt: "0.01g" }
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = EUSHOP_DATA;
}
