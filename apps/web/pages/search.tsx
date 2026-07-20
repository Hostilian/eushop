import { useCallback, useEffect, useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { ProductCard } from '../components/ui/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { foodAPI, FoodItem } from '../lib/services';
import type { StatusOrigin } from '../lib/degradation';
import { Button } from '../components/ui/Button';
import { readCart, writeCart } from '../lib/storageSafety';
import { EU_ALLERGENS_14 } from '@eushop/compliance';

// --- Constants for better readability and maintainability ---
const PAGE_SIZE = 20;
const DEBOUNCE_DELAY_MS = 400;

const EU_COUNTRIES = [
  '', 'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
  'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece',
  'Hungary', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg',
  'Malta', 'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia',
  'Slovenia', 'Spain', 'Sweden',
];

const FOOD_CATEGORIES = [
  '', 'Chocolate', 'Cheese', 'Wine', 'Charcuterie', 'Candy', 'Biscuit', 'Sweet', 'Savory', 'Drink', 'Condiment', 'Dairy', 'Pastry', 'Noodle'
];

const EU_ALLERGENS = ['', ...EU_ALLERGENS_14];

const ORIGIN_LABEL: Record<StatusOrigin, string> = {
  live: 'Live marketplace catalogue',
  cache: 'Recently loaded catalogue',
  demo: 'Demonstration catalogue',
  local: 'Local catalogue',
  offline: 'Offline catalogue',
};

// Mapping for food images based on keywords
const FOOD_IMAGE_MAP: { [key: string]: string } = {
  chocolate: '/images/belgian_chocolates.png',
  praline: '/images/belgian_chocolates.png',
  truffle: '/images/belgian_chocolates.png',
  oil: '/images/italian_olive_oil.png',
  vinegar: '/images/italian_olive_oil.png',
  balsamic: '/images/italian_olive_oil.png',
  cheese: '/images/spanish_manchego.png',
  brie: '/images/spanish_manchego.png',
  manchego: '/images/spanish_manchego.png',
  sausage: '/images/german_delicatessen.png',
  speck: '/images/german_delicatessen.png',
  deli: '/images/german_delicatessen.png',
  marzipan: '/images/german_delicatessen.png',
};

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAllergen, setSelectedAllergen] = useState('');
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [selectedDietary, setSelectedDietary] = useState('');
  const [selectedThermal, setSelectedThermal] = useState('');
  const [selectedQualityScheme, setSelectedQualityScheme] = useState('');
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [catalogueOrigin, setCatalogueOrigin] = useState<StatusOrigin | null>(null);

  const getFoodImage = (foodName: string): string | undefined => {
    const nameLower = foodName.toLowerCase();
    for (const keyword in FOOD_IMAGE_MAP) {
      if (nameLower.includes(keyword)) {
        return FOOD_IMAGE_MAP[keyword];
      }
    }
    return undefined;
  };

  const performSearch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await foodAPI.searchWithOrigin(
        searchQuery,
        selectedCountry,
        page,
        PAGE_SIZE,
        selectedCategory,
        selectedAllergen,
      );
      let foodsArray = result.data;
      if (minPrice !== null) foodsArray = foodsArray.filter(food => food.price >= minPrice);
      if (maxPrice !== null) foodsArray = foodsArray.filter(food => food.price <= maxPrice);
      if (selectedDietary) {
        foodsArray = foodsArray.filter(food => food.dietaryRestrictions?.includes(selectedDietary));
      }
      if (selectedThermal) {
        foodsArray = foodsArray.filter(food => (food as any).thermalCategory === selectedThermal);
      }
      if (selectedQualityScheme) {
        foodsArray = foodsArray.filter(food => (food as any).qualityScheme === selectedQualityScheme);
      }
      setFoods(foodsArray);
      setCatalogueOrigin(result.origin);
    } catch {
      setError('Search service is temporarily unavailable. Please try again later.');
      setFoods([]);
      setCatalogueOrigin('offline');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCountry, selectedCategory, selectedAllergen, minPrice, maxPrice, selectedDietary, selectedThermal, selectedQualityScheme, page]);

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      performSearch();
    }, DEBOUNCE_DELAY_MS); // Debounce search input

    return () => clearTimeout(delayTimer);
  }, [performSearch]);

  const handleAddToCart = (id: string) => {
    try {
      const cart = readCart();
      const existingItemIndex = cart.findIndex((item: any) => item.id === id);

      if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
      } else {
        const itemToAdd = foods.find((f) => f.id === id);
        if (itemToAdd) {
          cart.push({
            id: itemToAdd.id,
            name: itemToAdd.name,
            price: itemToAdd.price,
            country: itemToAdd.country,
            quantity: 1,
            sellerId: itemToAdd.sellerId,
            finderFee: itemToAdd.finderFee || 5.00 // Default finderFee if not present
          });
        }
      }
      const result = writeCart(cart);
      if (!result.ok) throw new Error('Cart storage is unavailable.');
      window.dispatchEvent(new Event('cart-updated')); // Notify other components about cart change
    } catch (e) {
      console.error('Failed to add to cart:', e);
    }
  };

  return (
    <PageWrapper>
      <div className="py-6">
        <h1 className="text-3xl font-extrabold text-brand-dark dark:text-white mb-2 font-display">
          Find Specialty Foods Across the EU
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 max-w-2xl leading-relaxed">
          Search marketplace listings by name or country and compare seller identity, origin, and food information before choosing an item.
        </p>

        {catalogueOrigin && (
          <p
            className="mb-6 w-fit rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            role="status"
            aria-live="polite"
          >
            {ORIGIN_LABEL[catalogueOrigin]}
            {catalogueOrigin === 'demo' && ' · Illustrative products, prices, traders, and label data'}
          </p>
        )}

        {/* Filter Bar */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-sm mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            <div>
              <label htmlFor="search-input" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Search Listings
              </label>
              <input
                id="search-input"
                type="text"
                placeholder="e.g., Belgian Chocolates, Balsamic..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1); // Reset page on new search query
                }}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent text-sm transition text-gray-800 dark:text-gray-200"
              />
            </div>

            <div>
              <label htmlFor="country-select" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Origin Country
              </label>
              <select
                id="country-select"
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setPage(1); // Reset page on country change
                }}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent text-sm transition text-gray-800 dark:text-gray-200"
              >
                {EU_COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country || 'All Countries (EU member states only)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="category-select" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Food Category
              </label>
              <select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1); // Reset page on category change
                }}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent text-sm transition text-gray-800 dark:text-gray-200"
              >
                {FOOD_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat || 'All Categories'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="allergen-select" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Allergen-Free Filter
              </label>
              <select
                id="allergen-select"
                value={selectedAllergen}
                onChange={(e) => {
                  setSelectedAllergen(e.target.value);
                  setPage(1); // Reset page on allergen change
                }}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent text-sm transition text-gray-800 dark:text-gray-200"
              >
                {EU_ALLERGENS.map((allergen) => (
                  <option key={allergen} value={allergen}>
                    {allergen ? `Free from ${allergen}` : 'No Exclusion Filters (Show All)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="dietary-select" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Dietary Preference
              </label>
              <select
                id="dietary-select"
                value={selectedDietary}
                onChange={(e) => {
                  setSelectedDietary(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent text-sm transition text-gray-800 dark:text-gray-200"
              >
                <option value="">All Dietary Options</option>
                <option value="Organic">Organic</option>
                <option value="Gluten-Free">Gluten-Free</option>
                <option value="Vegan">Vegan</option>
                <option value="Vegetarian">Vegetarian</option>
              </select>
            </div>

            <div>
              <label htmlFor="thermal-select" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Thermal Packaging
              </label>
              <select
                id="thermal-select"
                value={selectedThermal}
                onChange={(e) => {
                  setSelectedThermal(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent text-sm transition text-gray-800 dark:text-gray-200"
              >
                <option value="">All Thermal Categories</option>
                <option value="ambient">🌡️ Ambient (15-25°C)</option>
                <option value="chilled_2_8C">❄️ Chilled (2-8°C)</option>
                <option value="frozen_minus_18C">🧊 Frozen (-18°C)</option>
              </select>
            </div>

            <div>
              <label htmlFor="quality-scheme-select" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                EU Quality Designation
              </label>
              <select
                id="quality-scheme-select"
                value={selectedQualityScheme}
                onChange={(e) => {
                  setSelectedQualityScheme(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent text-sm transition text-gray-800 dark:text-gray-200"
              >
                <option value="">All Schemes (Verified & Standard)</option>
                <option value="PDO">🏅 PDO (Protected Designation of Origin)</option>
                <option value="PGI">🏅 PGI (Protected Geographical Indication)</option>
                <option value="TSG">🏅 TSG (Traditional Speciality Guaranteed)</option>
              </select>
            </div>

            <div>
              <label htmlFor="min-price" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Min Price (€)
              </label>
              <input
                id="min-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="Min"
                value={minPrice ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setMinPrice(value === '' ? null : parseFloat(value));
                  setPage(1); // Reset page on price change
                }}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent text-sm transition text-gray-800 dark:text-gray-200"
              />
            </div>

            <div>
              <label htmlFor="max-price" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Max Price (€)
              </label>
              <input
                id="max-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="Max"
                value={maxPrice ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setMaxPrice(value === '' ? null : parseFloat(value));
                  setPage(1); // Reset page on price change
                }}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent text-sm transition text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 p-4 rounded-2xl mb-8 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => performSearch()}>
              Retry
            </Button>
          </div>
        )}

        {/* Results Display */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </div>
        ) : foods.length > 0 ? (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
              {foods[0]?.id?.startsWith('offline-fallback')
                ? 'You are offline. Showing cached data if available.'
                : `Showing ${foods.length} delicacies found`}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {foods.map((food) => (
                <ProductCard
                  key={food.id}
                  id={food.id}
                  name={food.name}
                  description={food.description || ''}
                  price={food.price}
                  country={food.country}
                  imageUrl={food.imageUrl ?? getFoodImage(food.name)}
                  allergens={food.allergens || []}
                  netQuantity={(food as any).netQuantity}
                  thermalCategory={(food as any).thermalCategory}
                  qualityScheme={(food as any).qualityScheme}
                  qualitySchemeVerified={(food as any).qualitySchemeVerified}
                  seller={{
                    // COMPLIANCE-REVIEW: A missing trader name must not be replaced with a fabricated identity.
                    name: food.seller?.name || 'Seller identity unavailable',
                    rating: food.seller?.rating ?? 0,
                    verified: food.seller?.verified === true,
                  }}
                  onAddToCart={handleAddToCart}
                  origin={catalogueOrigin}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-4 mt-12">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(prevPage => Math.max(1, prevPage - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Page {page}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(prevPage => prevPage + 1)}
              >
                Next
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-8">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
              No results match your filters.
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
              Try removing a filter — for example, clear the allergen exclusion or broaden the country.
            </p>
            <Button
              variant="primary"
              onClick={() => {
                setSearchQuery('');
                setSelectedCountry('');
                setSelectedCategory('');
                setSelectedAllergen('');
                setSelectedDietary('');
                setSelectedThermal('');
                setSelectedQualityScheme('');
                setMinPrice(null);
                setMaxPrice(null);
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
