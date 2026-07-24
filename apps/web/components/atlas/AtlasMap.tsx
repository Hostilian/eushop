import React, { useState } from 'react';
import { ALL_EU_COUNTRIES, type EUCountryMetadata } from '../../data/atlas-countries';
import { ATLAS_MAP_ASSETS, type TerroirMapAsset } from '../v77/discovery/EuropeanFoodAtlas';
import { getAssetPath } from '../../lib/asset-path';

interface AtlasMapProps {
  selectedCountryCode: string;
  onSelectCountry: (countryCode: string) => void;
  productCountByCountry: Record<string, number>;
}

export const AtlasMap: React.FC<AtlasMapProps> = ({
  selectedCountryCode,
  onSelectCountry,
  productCountByCountry,
}) => {
  const [hoveredCountry, setHoveredCountry] = useState<EUCountryMetadata | null>(null);
  const [activeModalMap, setActiveModalMap] = useState<TerroirMapAsset | null>(null);

  const activeCountry = ALL_EU_COUNTRIES.find((c) => c.code === selectedCountryCode) || null;

  return (
    <div className="w-full bg-[#18212A] text-[#F6F0E5] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#D29A38]/30 font-sans space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <span className="text-xs font-mono font-bold text-[#D29A38] uppercase tracking-widest block mb-1">
            INTERACTIVE GEOGRAPHIC NODE GRID
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
            European Culinary Geography
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
            Click any country pin to filter authentic regional foods, protected origin designations, and verified European producers.
          </p>
        </div>

        {/* Selected Country Badge */}
        <div className="bg-[#201B17] px-5 py-3 rounded-2xl border border-[#D29A38]/30 flex items-center gap-3 shrink-0">
          <span className="text-3xl">{activeCountry ? activeCountry.flag : '🇪🇺'}</span>
          <div>
            <span className="text-[10px] font-mono font-bold text-[#D29A38] uppercase block">ACTIVE GEOGRAPHY</span>
            <span className="text-base font-extrabold text-white font-display">
              {activeCountry ? activeCountry.name : 'All European Union'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Map & Detail Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Interactive Map Canvas */}
        <div className="lg:col-span-7 relative bg-[#201B17] rounded-2xl p-6 border border-gray-800 min-h-[380px] flex flex-col justify-between overflow-hidden shadow-inner">
          <div className="flex items-center justify-between text-xs text-gray-400 font-mono mb-2">
            <span>EUROPEAN TERROIR MAP</span>
            <span className="text-emerald-400 font-bold">● 27 Active EU Country Nodes</span>
          </div>

          {/* SVG Map Container */}
          <div className="relative w-full h-[320px] bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-center p-4">
            {/* Grid background lines */}
            <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M 0,20 L 100,20 M 0,40 L 100,40 M 0,60 L 100,60 M 0,80 L 100,80" stroke="#F6F0E5" strokeWidth="0.3" strokeDasharray="1,1" />
              <path d="M 20,0 L 20,100 M 40,0 L 40,100 M 60,0 L 60,100 M 80,0 L 80,100" stroke="#F6F0E5" strokeWidth="0.3" strokeDasharray="1,1" />
            </svg>

            {/* Country Pin Nodes */}
            {ALL_EU_COUNTRIES.map((country) => {
              const isSelected = country.code === selectedCountryCode;
              const count = productCountByCountry[country.code] || 0;

              return (
                <button
                  key={country.code}
                  onClick={() => onSelectCountry(country.code)}
                  onMouseEnter={() => setHoveredCountry(country)}
                  onMouseLeave={() => setHoveredCountry(null)}
                  style={{ left: `${country.coordinates.x}%`, top: `${country.coordinates.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-200 focus:outline-none ${
                    isSelected ? 'z-30 scale-125' : 'z-10 hover:scale-110'
                  }`}
                  aria-label={`Select ${country.name}`}
                >
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition border shadow-lg ${
                      isSelected
                        ? 'bg-[#D29A38] text-[#201B17] border-white ring-4 ring-[#D29A38]/40'
                        : 'bg-[#201B17]/90 text-gray-200 border-gray-700 hover:border-white'
                    }`}
                  >
                    <span>{country.flag}</span>
                    <span className="font-mono text-[10px]">{country.code}</span>
                    {count > 0 && (
                      <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-[#385543] text-white">
                        {count}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400 mt-3">
            <span>Hover or click pin to inspect culinary region & specialties</span>
            <button
              onClick={() => onSelectCountry('ALL')}
              className="text-[#D29A38] font-bold hover:underline"
            >
              Reset to All Europe →
            </button>
          </div>
        </div>

        {/* Selected / Hovered Country Detail Panel */}
        <div className="lg:col-span-5 bg-[#F6F0E5] text-[#201B17] rounded-2xl p-6 sm:p-7 border border-[#201B17]/20 shadow-xl flex flex-col justify-between min-h-[380px]">
          {activeCountry ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#201B17]/15 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{activeCountry.flag}</span>
                  <div>
                    <h3 className="text-2xl font-black font-display text-[#201B17]">
                      {activeCountry.name}
                    </h3>
                    <span className="text-xs font-mono font-bold text-[#385543] uppercase tracking-wider">
                      {activeCountry.culinaryRegion}
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-[#385543]/10 text-[#385543] border border-[#385543]/20 font-mono">
                  {productCountByCountry[activeCountry.code] || 0} Foods Mapped
                </span>
              </div>

              <p className="text-xs text-[#201B17]/80 leading-relaxed">
                {activeCountry.shortDescription}
              </p>

              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#201B17]/60 block mb-1.5">
                  Famous Regional Dishes & Heritage Products
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeCountry.famousSpecialties.map((spec) => (
                    <span
                      key={spec}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#201B17]/10 text-[#201B17] border border-[#201B17]/15"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {activeCountry.topPdoPgi.length > 0 && (
                <div className="p-3.5 rounded-xl bg-[#385543]/10 border border-[#385543]/20 text-xs space-y-1">
                  <span className="font-extrabold text-[#385543] flex items-center gap-1 uppercase text-[10px]">
                    <span>🛡️</span> Protected Designation (PDO / PGI)
                  </span>
                  <p className="font-bold text-[#201B17]">{activeCountry.topPdoPgi.join(' · ')}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-[#201B17]/15 pb-4">
                <span className="text-4xl">🇪🇺</span>
                <div>
                  <h3 className="text-2xl font-black font-display text-[#201B17]">
                    European Union
                  </h3>
                  <span className="text-xs font-mono font-bold text-[#385543] uppercase tracking-wider">
                    27 Member States
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#201B17]/80 leading-relaxed">
                Select any country pin on the map to filter products, inspect PDO/PGI designations, and order directly from local European artisanal producers.
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-[#201B17]/15">
            <button
              onClick={() => onSelectCountry(activeCountry ? activeCountry.code : 'ALL')}
              className="w-full py-3 bg-[#201B17] hover:bg-black text-[#F6F0E5] font-extrabold text-xs rounded-xl transition shadow-md"
            >
              {activeCountry ? `Show ${activeCountry.name} Products Only →` : 'Browse All European Products →'}
            </button>
          </div>
        </div>
      </div>

      {/* Terroir Showcase Maps Rail */}
      <div className="pt-6 border-t border-gray-800">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span>🖼️</span> Terroir Cartography Showcase
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ATLAS_MAP_ASSETS.map((asset) => (
            <div
              key={asset.id}
              onClick={() => setActiveModalMap(asset)}
              className="group cursor-pointer bg-[#201B17] border border-gray-800 rounded-xl overflow-hidden hover:border-[#D29A38] transition p-2"
            >
              <div className="h-28 w-full overflow-hidden rounded-lg bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getAssetPath(asset.src)}
                  alt={asset.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <p className="text-xs font-bold text-[#F6F0E5] mt-2 line-clamp-1 group-hover:text-[#D29A38] transition">
                {asset.title}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeModalMap && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md p-4 sm:p-8 flex items-center justify-center animate-fade-in">
          <div className="relative max-w-5xl w-full bg-[#18212A] border border-gray-700 rounded-3xl overflow-hidden shadow-2xl p-6 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#D29A38] uppercase">{activeModalMap.badge}</span>
                <h3 className="text-xl font-black text-white">{activeModalMap.title}</h3>
              </div>
              <button
                onClick={() => setActiveModalMap(null)}
                className="w-10 h-10 rounded-full bg-slate-800 text-white font-bold text-lg flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <div className="relative flex-1 overflow-auto rounded-2xl bg-black p-2 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getAssetPath(activeModalMap.src)} alt={activeModalMap.title} className="max-h-[70vh] w-auto object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
