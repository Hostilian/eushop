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
  coordinates: { x: number; y: number }; // Percentage map coordinates
}

export const EUROPEAN_ORIGINS: CountryOrigin[] = [
  { id: 'IT', name: 'Italy', flag: '🇮🇹', code: 'IT', specialty: 'Parmigiano, Truffles & Balsamic', topItem: 'Parmigiano Reggiano DOP 24-Month', sellerCount: 14, coordinates: { x: 55, y: 68 } },
  { id: 'FR', name: 'France', flag: '🇫🇷', code: 'FR', specialty: 'Roquefort, Dijon & Bordeaux Wine', topItem: 'Artisanal Dijon Mustard with White Wine', sellerCount: 18, coordinates: { x: 40, y: 55 } },
  { id: 'ES', name: 'Spain', flag: '🇪🇸', code: 'ES', specialty: 'Jamón Ibérico & EVOO', topItem: 'Jamón Ibérico de Bellota 100%', sellerCount: 12, coordinates: { x: 26, y: 74 } },
  { id: 'DE', name: 'Germany', flag: '🇩🇪', code: 'DE', specialty: 'Black Forest Ham & Marzipan', topItem: 'Lübecker Edelmarzipan Box', sellerCount: 15, coordinates: { x: 49, y: 42 } },
  { id: 'GR', name: 'Greece', flag: '🇬🇷', code: 'GR', specialty: 'Feta DOP & Kalamata Olives', topItem: 'Raw Greek Thyme Honey from Crete', sellerCount: 9, coordinates: { x: 74, y: 82 } },
  { id: 'PT', name: 'Portugal', flag: '🇵🇹', code: 'PT', specialty: 'Conservas & Port Wine', topItem: 'Artisanal Portuguese Sardines in Olive Oil', sellerCount: 7, coordinates: { x: 16, y: 72 } },
  { id: 'NL', name: 'Netherlands', flag: '🇳🇱', code: 'NL', specialty: 'Gouda Aged 3 Years & Stroopwafels', topItem: 'Aged Gouda Reserve DOP', sellerCount: 8, coordinates: { x: 44, y: 35 } },
  { id: 'BE', name: 'Belgium', flag: '🇧🇪', code: 'BE', specialty: 'Artisanal Chocolates & Trappist Ale', topItem: 'Belgian Single-Origin Dark Pralines', sellerCount: 10, coordinates: { x: 42, y: 40 } },
  { id: 'AT', name: 'Austria', flag: '🇦🇹', code: 'AT', specialty: 'Pumpkin Seed Oil & Mozarts', topItem: 'Styrian Pumpkin Seed Oil g.g.A.', sellerCount: 6, coordinates: { x: 57, y: 50 } },
  { id: 'PL', name: 'Poland', flag: '🇵🇱', code: 'PL', specialty: 'Oscypek Cheese & Honey', topItem: 'Podhale Oscypek Smoked Cheese DOP', sellerCount: 5, coordinates: { x: 67, y: 38 } },
];

export const EuropeanFoodAtlas: React.FC = () => {
  const [selectedOrigin, setSelectedOrigin] = useState<CountryOrigin>(EUROPEAN_ORIGINS[0]);

  return (
    <div className="w-full bg-[#141613] text-[#fffdf8] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border border-[#dcd7cb]/20 relative overflow-hidden font-sans">
      {/* Editorial Background Accent */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-[#1845d4]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-[#dcd7cb]/15 pb-6 mb-8">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-[#e5a024]/20 text-[#e5a024] border border-[#e5a024]/30 uppercase tracking-widest">
            <span>🗺️</span> Interactive Food Atlas
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mt-3 text-white tracking-tight font-display">
            Shop Europe by Origin & Specialty
          </h2>
          <p className="text-sm text-[#dcd7cb]/80 mt-1 max-w-xl">
            Select a European region to explore verified local producers, protected origin specialties, and transparent cross-border shipping.
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Interactive European Map Canvas */}
        <div className="lg:col-span-7 relative bg-[#1c1f1b] rounded-2xl p-6 border border-[#dcd7cb]/10 min-h-[340px] flex flex-col justify-between overflow-hidden shadow-inner">
          <div className="flex items-center justify-between text-xs text-[#65675f] font-mono mb-2">
            <span>EUROPEAN REGIONAL MAP CANVAS</span>
            <span className="text-[#1845d4] font-bold">● Live Origin Nodes</span>
          </div>

          {/* Interactive Map Nodes Grid */}
          <div className="relative w-full h-[280px] bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-center p-4">
            {/* SVG Background Map Grid Lines */}
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M 0,20 L 100,20 M 0,40 L 100,40 M 0,60 L 100,60 M 0,80 L 100,80" stroke="#dcd7cb" strokeWidth="0.3" strokeDasharray="1,1" />
              <path d="M 20,0 L 20,100 M 40,0 L 40,100 M 60,0 L 60,100 M 80,0 L 80,100" stroke="#dcd7cb" strokeWidth="0.3" strokeDasharray="1,1" />
            </svg>

            {/* Country Nodes */}
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
            Click any country pin to inspect protected origin listings & producer compliance details.
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
                  <span className="text-xs font-bold text-[#65675f] uppercase tracking-wider">Verified Origin Region</span>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#1845d4]/10 text-[#1845d4] border border-[#1845d4]/20 font-mono">
                {selectedOrigin.sellerCount} Independent Sellers
              </span>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#65675f] block mb-1">
                  Regional Specialties
                </span>
                <p className="font-bold text-[#141613] text-base">{selectedOrigin.specialty}</p>
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
              Explore {selectedOrigin.name} Specialty Foods →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
