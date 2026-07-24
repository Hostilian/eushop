import React, { useState } from 'react';
import Link from 'next/link';

export interface CountryOrigin {
  id: string;
  name: string;
  flag: string;
  code: string;
  specialty: string;
  topItem: string;
  sellerCount: number;
  coordinates: { x: number; y: number };
}

export const EUROPEAN_ORIGINS: CountryOrigin[] = [
  { id: 'IT', name: 'Italy', flag: '🇮🇹', code: 'IT', specialty: 'Tagliatelle Ragù, Pizza Napoletana & Piadina', topItem: 'Tagliatelle al Ragù Bolognese DOP', sellerCount: 24, coordinates: { x: 55, y: 68 } },
  { id: 'FR', name: 'France', flag: '🇫🇷', code: 'FR', specialty: 'Beef Bourguignon, Bouillabaisse & Jambon-Beurre', topItem: 'Bouillabaisse de Marseille DOP', sellerCount: 28, coordinates: { x: 40, y: 55 } },
  { id: 'ES', name: 'Spain', flag: '🇪🇸', code: 'ES', specialty: 'Paella Valenciana, Cochinillo & Jamón Ibérico', topItem: 'Paella Valenciana Tradicional DOP', sellerCount: 22, coordinates: { x: 26, y: 74 } },
  { id: 'DE', name: 'Germany', flag: '🇩🇪', code: 'DE', specialty: 'Sauerbraten, Nürnberger Bratwurst & Currywurst', topItem: 'Nürnberger Rostbratwurst PGI', sellerCount: 19, coordinates: { x: 49, y: 42 } },
  { id: 'GR', name: 'Greece', flag: '🇬🇷', code: 'GR', specialty: 'Moussaka Santorini & Gyros Pita', topItem: 'Moussaka Santorini Tradicional DOP', sellerCount: 15, coordinates: { x: 74, y: 82 } },
  { id: 'PT', name: 'Portugal', flag: '🇵🇹', code: 'PT', specialty: 'Bacalhau à Brás, Bifana & Conservas', topItem: 'Bacalhau à Brás Tradicional PDO', sellerCount: 16, coordinates: { x: 16, y: 72 } },
  { id: 'NL', name: 'Netherlands', flag: '🇳🇱', code: 'NL', specialty: 'Aged Gouda DOP & Kapsalon', topItem: 'Aged Gouda Reserve DOP', sellerCount: 12, coordinates: { x: 44, y: 35 } },
  { id: 'BE', name: 'Belgium', flag: '🇧🇪', code: 'BE', specialty: 'Moules-Frites & Hazelnut Pralines', topItem: 'Moules-Frites de Bruges', sellerCount: 14, coordinates: { x: 42, y: 40 } },
  { id: 'AT', name: 'Austria', flag: '🇦🇹', code: 'AT', specialty: 'Wiener Schnitzel & Pumpkin Seed Oil', topItem: 'Wiener Schnitzel vom Kalb TSG', sellerCount: 11, coordinates: { x: 57, y: 50 } },
  { id: 'PL', name: 'Poland', flag: '🇵🇱', code: 'PL', specialty: 'Zapiekanka Krakowska & Pierniki', topItem: 'Zapiekanka Krakowska Open Baguette', sellerCount: 10, coordinates: { x: 67, y: 38 } },
];

export interface TerroirMapAsset {
  id: string;
  title: string;
  subtitle: string;
  src: string;
  badge: string;
}

export const ATLAS_MAP_ASSETS: TerroirMapAsset[] = [
  {
    id: 'iconic-dishes',
    title: '20 Iconic European Regional Dishes',
    subtitle: 'TasteAtlas Geographic Map of Europe’s Most Celebrated Regional Recipes & Heritage Meals',
    src: '/images/iconic_european_dishes.png',
    badge: 'Iconic Dishes Map',
  },
  {
    id: 'charcuterie-map',
    title: 'Artisanal Cured Meats & Cheese Atlas',
    subtitle: 'Visual Topography of Protected Charcuterie, Jamón Ibérico, Salamis & Mountain Cheeses',
    src: '/images/european_charcuterie_map.jpeg',
    badge: 'Charcuterie & Cheese Map',
  },
  {
    id: 'street-food-map',
    title: 'European Regional Street Food Map',
    subtitle: 'Comprehensive Guide to Iconic Local Sandwiches, Flatbreads, Fritters & Quick Bites across 25+ Nations',
    src: '/images/european_street_food_map.jpeg',
    badge: 'Street Food Map',
  },
  {
    id: 'terroir-ingredients',
    title: 'European Terroir & Raw Ingredients Atlas',
    subtitle: 'Geographical Distribution of Protected Olive Oils, Garlic, Herbs, Vegetables & Spices',
    src: '/images/european_ingredients_map.jpeg',
    badge: 'Terroir & Ingredients Map',
  },
];

export const EuropeanFoodAtlas: React.FC = () => {
  const [selectedOrigin, setSelectedOrigin] = useState<CountryOrigin>(EUROPEAN_ORIGINS[0]);
  const [activeModalMap, setActiveModalMap] = useState<TerroirMapAsset | null>(null);

  return (
    <div className="w-full bg-[#141613] text-[#fffdf8] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border border-[#dcd7cb]/20 relative overflow-hidden font-sans space-y-10">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-[#1845d4]/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-[#dcd7cb]/15 pb-6">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-[#e5a024]/20 text-[#e5a024] border border-[#e5a024]/30 uppercase tracking-widest">
            <span>🗺️</span> Interactive European Food Atlas V77
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mt-3 text-white tracking-tight font-display">
            Living Geographic Atlas of European Foods & Dishes
          </h2>
          <p className="text-sm text-[#dcd7cb]/80 mt-1 max-w-2xl">
            Explore authentic regional dishes, protected origin specialties (PDO/PGI/TSG), and terroir maps across Europe. Order direct from verified producers.
          </p>
        </div>

        {/* Selected Origin Quick Highlight Badge */}
        <div className="bg-[#fffdf8]/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-[#dcd7cb]/20 flex items-center gap-3">
          <span className="text-3xl">{selectedOrigin.flag}</span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#e5a024]">Active Region</p>
            <p className="text-base font-extrabold text-white">{selectedOrigin.name}</p>
          </div>
        </div>
      </div>

      {/* Section 1: Interactive Map Grid & Selected Origin Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Interactive European Map Canvas */}
        <div className="lg:col-span-7 relative bg-[#1c1f1b] rounded-2xl p-6 border border-[#dcd7cb]/10 min-h-[340px] flex flex-col justify-between overflow-hidden shadow-inner">
          <div className="flex items-center justify-between text-xs text-[#65675f] font-mono mb-2">
            <span>EUROPEAN REGIONAL MAP NODES</span>
            <span className="text-[#1845d4] font-bold">● Live Catalogue Pins</span>
          </div>

          {/* Interactive Map Nodes Grid */}
          <div className="relative w-full h-[280px] bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-center p-4">
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M 0,20 L 100,20 M 0,40 L 100,40 M 0,60 L 100,60 M 0,80 L 100,80" stroke="#dcd7cb" strokeWidth="0.3" strokeDasharray="1,1" />
              <path d="M 20,0 L 20,100 M 40,0 L 40,100 M 60,0 L 60,100 M 80,0 L 80,100" stroke="#dcd7cb" strokeWidth="0.3" strokeDasharray="1,1" />
            </svg>

            {EUROPEAN_ORIGINS.map((origin) => {
              const isSelected = origin.id === selectedOrigin.id;
              return (
                <button
                  key={origin.id}
                  onClick={() => setSelectedOrigin(origin)}
                  style={{ left: `${origin.coordinates.x}%`, top: `${origin.coordinates.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-200 focus:outline-none ${
                    isSelected ? 'z-30 scale-125' : 'z-10 hover:scale-110'
                  }`}
                  aria-label={`Select ${origin.name}`}
                >
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition border shadow-lg ${
                    isSelected
                      ? 'bg-[#1845d4] text-white border-white ring-4 ring-[#1845d4]/40'
                      : 'bg-[#141613]/90 text-gray-200 border-[#dcd7cb]/30 hover:border-white'
                  }`}>
                    <span>{origin.flag}</span>
                    <span className="hidden sm:inline font-mono">{origin.code}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-[#65675f] text-center mt-3">
            Click any country pin to inspect protected origin listings & specialty dishes.
          </p>
        </div>

        {/* Right Side: Selected Origin Specialty Card */}
        <div className="lg:col-span-5 bg-[#fffdf8] text-[#141613] rounded-2xl p-6 sm:p-7 border border-[#dcd7cb] shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#dcd7cb] pb-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedOrigin.flag}</span>
                <div>
                  <h3 className="text-2xl font-black font-display text-[#141613]">{selectedOrigin.name}</h3>
                  <span className="text-xs font-bold text-[#65675f] uppercase tracking-wider">Verified Regional Origin</span>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#1845d4]/10 text-[#1845d4] border border-[#1845d4]/20 font-mono">
                {selectedOrigin.sellerCount} Artisanal Sellers
              </span>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#65675f] block mb-1">
                  Famous Regional Dishes & Specialties
                </span>
                <p className="font-bold text-[#141613] text-base leading-snug">{selectedOrigin.specialty}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#f7f4ed] border border-[#dcd7cb]">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#365e38] flex items-center gap-1 mb-1">
                  <span>🛡️</span> Protected Designation Feature
                </span>
                <p className="font-bold text-sm text-[#141613]">{selectedOrigin.topItem}</p>
                <p className="text-xs text-[#65675f] mt-1">Direct shipping from local European producer with transparent VAT & allergen declarations.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#dcd7cb] flex flex-col gap-2">
            <Link
              href={`/search?country=${selectedOrigin.name}`}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#1845d4] hover:bg-[#102f8f] text-white font-extrabold text-sm rounded-xl transition shadow-md"
            >
              Order {selectedOrigin.name} Specialty Dishes & Products →
            </Link>
          </div>
        </div>
      </div>

      {/* Section 2: Four Featured Culinary Maps & Terroir Atlases */}
      <div className="pt-6 border-t border-[#dcd7cb]/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white font-display flex items-center gap-2">
              <span>🗺️</span> Artisanal European Food Maps & Terroir Showcase
            </h3>
            <p className="text-xs sm:text-sm text-[#dcd7cb]/70 mt-1">
              Interactive high-resolution cartography mapping Europe’s iconic dishes, street foods, cured meats, and terroir ingredients.
            </p>
          </div>
          <span className="text-xs font-mono text-[#e5a024] bg-[#e5a024]/10 border border-[#e5a024]/30 px-3 py-1.5 rounded-xl font-bold self-start sm:self-auto">
            4 Interactive Atlases Loaded
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ATLAS_MAP_ASSETS.map((asset) => (
            <div
              key={asset.id}
              className="group relative bg-[#1c1f1b] border border-[#dcd7cb]/15 rounded-2xl overflow-hidden hover:border-[#1845d4]/60 transition-all duration-300 shadow-xl flex flex-col justify-between"
            >
              <div className="relative h-64 w-full overflow-hidden bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.src}
                  alt={asset.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                  onClick={() => setActiveModalMap(asset)}
                />
                <div className="absolute top-3 left-3 bg-black/80 backdrop-blur px-3 py-1 rounded-full text-[11px] font-bold text-[#e5a024] border border-[#e5a024]/40">
                  {asset.badge}
                </div>
                <button
                  onClick={() => setActiveModalMap(asset)}
                  className="absolute bottom-3 right-3 bg-[#1845d4] hover:bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur shadow-lg flex items-center gap-1.5 transition"
                >
                  <span>🔍</span> View Full Resolution Map
                </button>
              </div>

              <div className="p-5">
                <h4 className="text-lg font-bold text-white group-hover:text-[#e5a024] transition-colors">
                  {asset.title}
                </h4>
                <p className="text-xs text-[#dcd7cb]/70 mt-1.5 leading-relaxed">
                  {asset.subtitle}
                </p>
                <div className="mt-4 pt-3 border-t border-[#dcd7cb]/10 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-emerald-400">✓ Fully Cataloged into EUshop</span>
                  <button
                    onClick={() => setActiveModalMap(asset)}
                    className="text-xs text-[#1845d4] font-bold hover:underline"
                  >
                    Inspect Map →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* High-Resolution Modal Lightbox */}
      {activeModalMap && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md p-4 sm:p-8 flex items-center justify-center animate-fade-in">
          <div className="relative max-w-5xl w-full bg-[#141613] border border-[#dcd7cb]/30 rounded-3xl overflow-hidden shadow-2xl p-6 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-[#dcd7cb]/20 pb-4 mb-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#e5a024] uppercase tracking-wider">{activeModalMap.badge}</span>
                <h3 className="text-xl sm:text-2xl font-black text-white font-display">{activeModalMap.title}</h3>
              </div>
              <button
                onClick={() => setActiveModalMap(null)}
                className="w-10 h-10 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-lg flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <div className="relative flex-1 overflow-auto rounded-2xl bg-black border border-neutral-800 p-2 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeModalMap.src}
                alt={activeModalMap.title}
                className="max-h-[70vh] w-auto object-contain rounded-lg"
              />
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#dcd7cb]/80">
              <p>{activeModalMap.subtitle}</p>
              <button
                onClick={() => setActiveModalMap(null)}
                className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition"
              >
                Close Atlas View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
