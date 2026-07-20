import { useState, useCallback, useMemo } from 'react';
import { FoodItem } from '../../data/demo-products';
import { EU_ALLERGENS_14, type EUAllergen } from '@eushop/compliance';
import { AllergenBadge, Badge } from '../ui/Badge';
import { clsx } from 'clsx';

interface AllergenFilterProps {
  products: FoodItem[];
  onFilterChange: (filteredProducts: FoodItem[]) => void;
}

export default function AllergenFilter({ products, onFilterChange }: AllergenFilterProps) {
  const [selectedAllergens, setSelectedAllergens] = useState<EUAllergen[]>([]);
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

  // Filter products based on selected allergens
  const filteredProducts = useCallback(() => {
    if (selectedAllergens.length === 0) {
      return products;
    }

    return products.filter(product => {
      const productAllergens = product.allergens || [];
      // Return products that contain AT LEAST ONE of the selected allergens
      return selectedAllergens.some(allergen =>
        productAllergens.includes(allergen)
      );
    });
  }, [products, selectedAllergens]);

  // Handle allergen toggle
  const toggleAllergen = useCallback((allergen: EUAllergen) => {
    setSelectedAllergens(prev => {
      if (prev.includes(allergen)) {
        return prev.filter(a => a !== allergen);
      }
      return [...prev, allergen];
    });
  }, []);

  // Get dietary badges for a product
  const getProductBadges = useCallback((product: FoodItem) => {
    const badges: string[] = [];

    // Check for PDO/PGI
    if (product.qualityScheme === 'PDO' || product.qualityScheme === 'PGI') {
      badges.push({
        label: product.qualityScheme === 'PDO' ? 'Protected Designation of Origin' : 'Protected Geographical Indication',
        variant: 'success' as const
      });
    }

    // Check for gluten-free (no gluten-containing cereals)
    const hasGluten = (product.allergens || []).includes('Cereals containing gluten');
    if (!hasGluten) {
      badges.push({ label: 'Gluten-Free', variant: 'info' as const });
    }

    // Check for organic (if available in dietary restrictions)
    // Note: This would need to be added to the data model or inferred from other fields
    if (product.dietaryRestrictions?.includes('Organic')) {
      badges.push({ label: 'Organic', variant: 'success' as const });
    }

    return badges;
  }, []);

  // Calculate stats for display
  const stats = useMemo(() => {
    const filtered = filteredProducts();
    const totalWithAllergens = products.filter(p =>
      (p.allergens || []).length > 0
    ).length;

    return {
      totalProducts: products.length,
      filteredCount: filtered.length,
      totalWithAllergens,
      percentageWithAllergens: totalWithAllergens > 0
        ? Math.round((totalWithAllergens / products.length) * 100)
        : 0
    };
  }, [products, filteredProducts]);

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

      {/* Stats bar */}
      <div className="bg-gray-50 dark:bg-gray-950/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Products</p>
            <p className="text-lg font-semibold text-brand-dark dark:text-white">{stats.totalProducts}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">With Allergens</p>
            <p className="text-lg font-semibold text-brand-dark dark:text-white">
              {stats.totalWithAllergens} ({stats.percentageWithAllergens}%)
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Selected Filters</p>
            <p className="text-lg font-semibold text-brand-dark dark:text-white">
              {selectedAllergens.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Matching Products</p>
            <p className="text-lg font-semibold text-brand-dark dark:text-white">
              {stats.filteredCount}
            </p>
          </div>
        </div>
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
            onClick={() => setSelectedAllergens([])}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold"
            variant="secondary"
            size="sm"
          >
            <span aria-hidden="true">🗑️</span>
            Clear All Filters
          </button>
        )}
      </div>

      {/* Selected allergens summary */}
      {selectedAllergens.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <p className="font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2 mb-1">
            <span aria-hidden="true">🎯</span>
            Active Filters: {selectedAllergens.length} selected
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedAllergens.map(allergen => (
              <span key={allergen} className="px-2.5 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900 rounded-full">
                {allergen.split(' ')[0]}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Showing products that contain ANY of the selected allergens
          </p>
        </div>
      )}
    </div>
  );
}