/**
 * EUshop v177 Production-Grade Ground-Up Dataset
 * Verified pan-European specialty food listings across EU member states with complete regulatory metadata.
 */
const EUSHOP_V177_DATA = {
  version: "v177",
  brand: "EUshop Production Grade",
  tagline: "Ground-Up Re-Founded Pan-European Specialty Food Marketplace",
  stats: {
    verifiedSellers: "2,150+",
    euCountries: 27,
    activeProducts: "24,500+",
    annualVatReconciled: "€19.8M"
  },
  categories: [
    { id: "cheese", name: "Artisanal Cheeses & Dairy", icon: "🧀", count: 6120 },
    { id: "charcuterie", name: "Cured Meats & Salumi", icon: "🥩", count: 4510 },
    { id: "olive-oil", name: "Extra Virgin Olive Oils", icon: "🫒", count: 3840 },
    { id: "wine", name: "Organic & Heritage Wines", icon: "🍷", count: 5200 },
    { id: "pantry", name: "Preserves, Honey & Spices", icon: "🍯", count: 4830 }
  ],
  featuredProducts: [
    {
      id: "v177-101",
      name: "Parmigiano Reggiano DOP (36 Months Aged)",
      origin: "Italy (Reggio Emilia)",
      flag: "🇮🇹",
      category: "cheese",
      price: 36.00,
      unit: "per 1 kg wheel section",
      rating: 4.99,
      reviewsCount: 489,
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
      description: "Handcrafted 36-month vacuum-aged Parmigiano Reggiano DOP. Produced exclusively with unpasteurized milk from local Vacche Rosse herds."
    },
    {
      id: "v177-102",
      name: "Jamón Ibérico de Bellota 100% Pata Negra",
      origin: "Spain (Jabugo)",
      flag: "🇪🇸",
      category: "charcuterie",
      price: 92.00,
      unit: "per 500g hand-carved pack",
      rating: 5.00,
      reviewsCount: 680,
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
      description: "100% Pure Iberian Bellota Ham, cured for 48 months in natural cellars of Sierra de Aracena. Rich in oleic acid with delicate marbling."
    },
    {
      id: "v177-103",
      name: "Kalamata EVOO PDO Unfiltered Cold Pressed",
      origin: "Greece (Messinia)",
      flag: "🇬🇷",
      category: "olive-oil",
      price: 19.50,
      unit: "per 750ml dark glass bottle",
      rating: 4.96,
      reviewsCount: 312,
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
      description: "Single-estate extra virgin olive oil harvested from centuries-old Koroneiki trees in Kalamata. Acidity < 0.2%."
    },
    {
      id: "v177-104",
      name: "Châteauneuf-du-Pape AOC Rouge 2019",
      origin: "France (Rhône Valley)",
      flag: "🇫🇷",
      category: "wine",
      price: 54.00,
      unit: "per 750ml bottle",
      rating: 4.94,
      reviewsCount: 245,
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
      description: "Grenache-dominant biodynamic blend aged in oak foudres. Notes of dark cherries, garrigue herbs, and crushed black pepper."
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = EUSHOP_V177_DATA;
}
