import React from 'react';
import { ALL_EU_COUNTRIES } from '../../data/atlas-countries';

interface AtlasCountryRailProps {
  selectedCountryCode: string;
  onSelectCountry: (countryCode: string) => void;
  productCountByCountry: Record<string, number>;
}

export const AtlasCountryRail: React.FC<AtlasCountryRailProps> = ({
  selectedCountryCode,
  onSelectCountry,
  productCountByCountry,
}) => {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold text-[#201B17]/60 uppercase tracking-widest">
          BROWSE EUROPE BY COUNTRY
        </span>
        <button
          onClick={() => onSelectCountry('ALL')}
          className={`text-xs font-bold transition ${
            selectedCountryCode === 'ALL'
              ? 'text-[#385543] underline'
              : 'text-[#201B17]/60 hover:text-[#201B17]'
          }`}
        >
          Reset to All 27 EU Member States
        </button>
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-gray-400">
        {/* Reset / All Europe Card */}
        <button
          onClick={() => onSelectCountry('ALL')}
          className={`shrink-0 px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 border shadow-sm ${
            selectedCountryCode === 'ALL'
              ? 'bg-[#201B17] text-[#F6F0E5] border-[#201B17] shadow-md ring-2 ring-[#201B17]/20'
              : 'bg-[#F6F0E5] text-[#201B17] border-[#201B17]/20 hover:border-[#201B17]'
          }`}
        >
          <span>🇪🇺</span>
          <span>All Europe</span>
        </button>

        {/* 27 EU Member States Cards */}
        {ALL_EU_COUNTRIES.map((country) => {
          const isSelected = country.code === selectedCountryCode;
          const count = productCountByCountry[country.code] || 0;

          return (
            <button
              key={country.code}
              onClick={() => onSelectCountry(country.code)}
              className={`shrink-0 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border shadow-sm ${
                isSelected
                  ? 'bg-[#D29A38] text-[#201B17] border-[#D29A38] shadow-md ring-2 ring-[#D29A38]/30 font-black'
                  : 'bg-[#F6F0E5] text-[#201B17] border-[#201B17]/15 hover:border-[#201B17]/40'
              }`}
            >
              <span className="text-base">{country.flag}</span>
              <span>{country.name}</span>
              {count > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black ${
                    isSelected
                      ? 'bg-[#201B17] text-[#D29A38]'
                      : 'bg-[#385543]/15 text-[#385543]'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
