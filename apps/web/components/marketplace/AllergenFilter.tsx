import { useState, useCallback } from 'react';
import { FoodItem } from '../../data/demo-products';
import { EU_ALLERGENS_14, type EUAllergen } from '@eushop/compliance';
import { AllergenBadge, Badge } from '../ui/Badge';
import { clsx } from 'clsx';

interface AllergenFilterProps {
  products: FoodItem[];
  selectedAllergens: EUAllergen[];
  onSelectAllergen: (selected: EUAllergen[]) => void;
}

export default function AllergenFilter({ products, selectedAllergens, onSelectAllergen }: AllergenFilterProps) {
  const [showTooltip, setShowTooltip] = useState<EUAllergen | null>(null);

  // Helper explanations for each allergen
  const allergenExplanations: Record<EUAllergen, string> = {
    'Cereals containing gluten': 'Contains wheat, rye, barley, oats, spelt, kamut or their hybridised strains',
    'Crustaceans': 'Includes crab, lobster, crayfish, shrimp, prawn',
    'Eggs': 'Chicken eggs and other bird eggs',
    'Fish': 'All species of fish and fish products',
    'Peanuts': 'Legume commonly known as groundnut',
    'Soybeans': 'Soy beans and soy-derived products',
    'Milk': 'Milk from cows, goats, sheep and other mammals',
    'Nuts': 'Almonds, hazelnuts, walnuts, cashews, pecans, brazils, pistachios, macadamia, Queensland nuts',
    'Celery': 'Includes celery stalks, leaves, seeds and celeriac',
    'Mustard': 'Liquid mustard, mustard powder and mustard seeds',
    'Sesame seeds': 'Sesame seeds and sesame seed paste (tahini)',
    'Sulphur dioxide and sulphites': 'Preservative E220-E228 found in dried fruit, wine, etc.',
    'Lupin': 'Lupin beans and flour, common in gluten-free baking',
    'Molluscs': 'Includes mussels, oysters, squid, snails and clams'
  };

  // Handler to toggle an allergen
  const toggleAllergen = useCallback((allergen: EUAllergen) => {
    const isSelected = selectedAllergens.includes(allergen);
    let newSelection: EUAllergen[];
    if (isSelected) {
      newSelection = selectedAllergens.filter(a => a !== allergen);
    } else {
      newSelection = [...selectedAllergens, allergen];
    }
    onSelectAllergen(newSelection);
  }, [selectedAllergens, onSelectAllergen]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-lg font-semibold text-brand-dark dark:text-white flex items-center gap-2">
          <span aria-hidden="true">⚠️</span>
          Allergen & Dietary Filters
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Filter products by allergens they contain. See dietary info badges on products.
        </p>
      </div>

      {/* Allergen selection buttons */}
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {EU_ALLERGENS_14.map(allergen => {
            const isSelected = selectedAllergens.includes(allergen);
            const explanation = allergenExplanations[allergen];

            return (
              <div
                key={allergen}
                onMouseEnter={() => setShowTooltip(allergen)}
                onMouseLeave={() => setShowTooltip(null)}
                className="group"
              >
                <button
                  onClick={() => toggleAllergen(allergen)}
                  className={[
                    'w-full flex flex-col items-center justify-center gap-2 p-3 text-center',
                    'border rounded-xl transition-all duration-200 hover:shadow-md',
                    isSelected
                      ? 'bg-brand-dark/10 border-brand-dark/20 text-brand-dark hover:bg-brand-dark/20'
                      : 'bg-gray-50 dark:bg-gray-950/50 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900'
                  ].join(' ')}
                  aria-pressed={isSelected}
                >
                  <AllergenBadge allergen={allergen} />
                  <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                    {allergen.split(' ')[0]}
                  </span>
                </button>

                {/* Tooltip */}
                {showTooltip === allergen && (
                  <div className={[
                    'absolute left-0 top-full mt-2 w-64 p-3 rounded-xl shadow-lg',
                    'bg-gray-900 text-white text-xs',
                    'z-50 max-w-xs whitespace-normal'
                  ].join(' ')}>
                    <div className="flex items-start gap-2">
                      <span aria-hidden="true">⚠️</span>
                      <div>
                        <p className="font-medium">{allergen}</p>
                        <p className="mt-1">{explanation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Clear button */}
        {selectedAllergens.length > 0 && (
          <button
            onClick={() => onSelectAllergen([])}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold"
            variant="secondary"
            size="sm"
          >
            <span aria-hidden="true">🗑️</span>
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );
}