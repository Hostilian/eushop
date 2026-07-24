import React from 'react';
import type { EUAllergen } from '@eushop/compliance';

export interface AtlasFilterState {
  selectedCountry: string;
  selectedCategory: string;
  selectedQualityScheme: string;
  maxPrice: number;
  excludedAllergens: EUAllergen[];
}

interface AtlasFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AtlasFilterState;
  onFilterChange: (newFilters: AtlasFilterState) => void;
  onResetFilters: () => void;
  totalMatching: number;
}

const ALL_EU_ALLERGENS: EUAllergen[] = [
  'Cereals containing gluten',
  'Crustaceans',
  'Eggs',
  'Fish',
  'Peanuts',
  'Soybeans',
  'Milk',
  'Nuts',
  'Celery',
  'Mustard',
  'Sesame seeds',
  'Sulphur dioxide and sulphites',
  'Lupin',
  'Molluscs',
];

export const AtlasFilterPanel: React.FC<AtlasFilterPanelProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onResetFilters,
  totalMatching,
}) => {
  if (!isOpen) return null;

  const toggleAllergen = (allergen: EUAllergen) => {
    const exists = filters.excludedAllergens.includes(allergen);
    const updated = exists
      ? filters.excludedAllergens.filter((a) => a !== allergen)
      : [...filters.excludedAllergens, allergen];

    onFilterChange({ ...filters, excludedAllergens: updated });
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm flex justify-end animate-fade-in font-sans">
      <div className="w-full max-w-md bg-[#F6F0E5] text-[#201B17] h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#201B17]/15 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#385543] uppercase">CATALOG SEARCH FILTERS</span>
              <h3 className="text-2xl font-black font-display text-[#201B17]">Refine Atlas Results</h3>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#201B17]/10 text-[#201B17] font-bold flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          {/* Quality Designation Filter */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-[#201B17]/70 uppercase block">
              Protected Quality Scheme (EU Reg 1151/2012)
            </label>
            <div className="flex flex-wrap gap-2">
              {['ALL', 'PDO', 'PGI', 'TSG'].map((scheme) => (
                <button
                  key={scheme}
                  onClick={() => onFilterChange({ ...filters, selectedQualityScheme: scheme })}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition ${
                    filters.selectedQualityScheme === scheme
                      ? 'bg-[#D29A38] text-[#201B17] shadow-sm'
                      : 'bg-white text-[#201B17] border border-[#201B17]/15'
                  }`}
                >
                  {scheme === 'ALL' ? 'All Quality Schemes' : `${scheme} Protected`}
                </button>
              ))}
            </div>
          </div>

          {/* Max Price Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono font-bold">
              <span className="text-[#201B17]/70 uppercase">Maximum Price</span>
              <span className="text-[#201B17]">€{filters.maxPrice}</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={filters.maxPrice}
              onChange={(e) => onFilterChange({ ...filters, maxPrice: Number(e.target.value) })}
              className="w-full accent-[#385543] cursor-pointer"
            />
          </div>

          {/* Allergen Exclusion Matrix */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-[#201B17]/70 uppercase block">
              Exclude Allergens (EU 14 Regulated Categories)
            </label>
            <div className="flex flex-wrap gap-1.5 text-[10px]">
              {ALL_EU_ALLERGENS.map((allergen) => {
                const isExcluded = filters.excludedAllergens.includes(allergen);
                return (
                  <button
                    key={allergen}
                    onClick={() => toggleAllergen(allergen)}
                    className={`px-2.5 py-1.5 rounded-lg font-bold transition border ${
                      isExcluded
                        ? 'bg-[#B54232] text-white border-[#B54232] shadow-sm'
                        : 'bg-white text-[#201B17] border-[#201B17]/15 hover:border-[#201B17]/40'
                    }`}
                  >
                    {isExcluded ? `✕ Exclude ${allergen}` : allergen}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panel Footer */}
        <div className="pt-6 border-t border-[#201B17]/15 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold">
            <span>Matching Foods:</span>
            <span className="text-[#385543]">{totalMatching} Items</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onResetFilters}
              className="w-1/3 py-3 bg-white text-[#201B17] font-bold text-xs rounded-xl border border-[#201B17]/20"
            >
              Reset Filters
            </button>
            <button
              onClick={onClose}
              className="w-2/3 py-3 bg-[#385543] text-white font-black text-xs rounded-xl shadow-md"
            >
              Apply & Show Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
