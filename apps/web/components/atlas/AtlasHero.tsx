import React, { useState } from 'react';
import Link from 'next/link';

interface AtlasHeroProps {
  onSearchSubmit: (query: string) => void;
  onCountrySelect: (countryCode: string) => void;
  totalProductsCount: number;
}

const SEARCH_SUGGESTIONS = [
  'Parmigiano Reggiano',
  'Jamón Ibérico',
  'Bouillabaisse',
  'Portugal',
  'Smoked Paprika',
  'Pistachio Cream',
  'Sauerbraten',
];

export const AtlasHero: React.FC<AtlasHeroProps> = ({
  onSearchSubmit,
  onCountrySelect,
  totalProductsCount,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearchSubmit(searchTerm.trim());
    }
  };

  return (
    <div className="relative w-full bg-[#18212A] text-[#F6F0E5] rounded-3xl overflow-hidden shadow-2xl border border-[#D29A38]/30 font-sans">
      {/* Editorial Background Accent */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-[500px] h-[500px] bg-[#D29A38]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-[400px] h-[400px] bg-[#385543]/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 p-8 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Editorial Statement & Universal Omnibox */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-[#D29A38]/20 text-[#D29A38] border border-[#D29A38]/40 uppercase tracking-widest font-mono">
              🗺️ EUshop V77 Flagship
            </span>
            <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              27 EU Nations • {totalProductsCount} Verified Foods
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] font-display">
            EAT EUROPE, <br />
            <span className="text-[#D29A38]">REGION BY REGION.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#F6F0E5]/80 max-w-xl leading-relaxed">
            A living map of European food, protected origin specialties (PDO/PGI/TSG), and verified local producers. Shop authentic dishes and products directly from where they belong.
          </p>

          {/* Universal Omnibox Search */}
          <form onSubmit={handleSubmit} className="pt-2 max-w-xl">
            <div className="relative flex items-center bg-[#201B17] border-2 border-[#D29A38]/50 rounded-2xl p-2 shadow-2xl focus-within:border-[#D29A38] transition-all">
              <span className="pl-3 text-xl text-[#D29A38]">🔍</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search a food, country, region, or producer..."
                className="w-full bg-transparent px-3 py-3 text-white placeholder-gray-400 text-sm font-medium focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#D29A38] hover:bg-[#b8832a] text-[#201B17] font-black text-sm rounded-xl transition shadow-lg shrink-0"
              >
                Search Atlas
              </button>
            </div>

            {/* Quick Search Chips */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-400 font-mono">Popular:</span>
              {SEARCH_SUGGESTIONS.slice(0, 4).map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setSearchTerm(chip);
                    onSearchSubmit(chip);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#201B17]/80 text-[#F6F0E5]/80 hover:text-white hover:bg-[#201B17] border border-gray-700 transition"
                >
                  {chip}
                </button>
              ))}
            </div>
          </form>

          {/* Quick Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onCountrySelect('ALL')}
              className="px-6 py-3.5 bg-[#385543] hover:bg-[#2c4435] text-white font-extrabold text-sm rounded-xl transition shadow-lg flex items-center gap-2"
            >
              <span>🗺️</span> Explore Interactive Map
            </button>
            <Link
              href="/cart"
              className="px-6 py-3.5 bg-[#201B17] hover:bg-black text-[#F6F0E5] font-extrabold text-sm rounded-xl border border-gray-700 transition flex items-center gap-2"
            >
              <span>🛒</span> View Basket
            </Link>
          </div>
        </div>

        {/* Right Column: Hero Visual Feature Box */}
        <div className="lg:col-span-5 relative">
          <div className="relative rounded-2xl overflow-hidden border border-[#D29A38]/30 shadow-2xl bg-black/60 aspect-[4/3] group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/iconic_european_dishes.png"
              alt="20 Iconic European Dishes Map"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
              <span className="text-xs font-mono font-bold text-[#D29A38] uppercase tracking-wider mb-1">
                Featured Terroir Showcase
              </span>
              <h3 className="text-xl font-black text-white font-display">
                20 Iconic European Heritage Dishes
              </h3>
              <p className="text-xs text-gray-300 mt-1 line-clamp-2">
                From Lisbon Bacalhau to Segovia Cochinillo and Naples Pizza Napoletana.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
