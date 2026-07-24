import React from 'react';

export interface FoodCategoryItem {
  id: string;
  name: string;
  icon: string;
}

export const FOOD_CATEGORIES: readonly FoodCategoryItem[] = [
  { id: 'ALL', name: 'All Categories', icon: '🍽️' },
  { id: 'Regional Specialty Dish', name: 'Regional Dishes', icon: '🍲' },
  { id: 'Street Food & Sandwich', name: 'Street Food', icon: '🥖' },
  { id: 'Cheese', name: 'Cheese & Dairy', icon: '🧀' },
  { id: 'Artisanal Sausage', name: 'Charcuterie & Meats', icon: '🥩' },
  { id: 'Regional Seafood Dish', name: 'Seafood & Conservas', icon: '🐟' },
  { id: 'Chocolate', name: 'Chocolate & Sweets', icon: '🍫' },
  { id: 'Spice', name: 'Spices & Seasonings', icon: '🧄' },
  { id: 'Oil', name: 'Oils & Vinegars', icon: '🫒' },
  { id: 'Preserve', name: 'Preserves & Jams', icon: '🍯' },
];

interface AtlasCategoryRailProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const AtlasCategoryRail: React.FC<AtlasCategoryRailProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="w-full space-y-2">
      <span className="text-xs font-mono font-bold text-[#201B17]/60 uppercase tracking-widest block">
        FOOD CATEGORY DEPARTMENTS
      </span>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {FOOD_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border shadow-sm ${
                isSelected
                  ? 'bg-[#385543] text-white border-[#385543] shadow-md ring-2 ring-[#385543]/30 font-black'
                  : 'bg-[#F6F0E5] text-[#201B17] border-[#201B17]/15 hover:border-[#201B17]/40'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
