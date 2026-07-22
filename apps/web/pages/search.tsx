import { useCallback, useEffect, useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { ProductCard } from '../components/ui/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { foodAPI, FoodItem } from '../lib/services';
<<<<<<< HEAD
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
=======
import { Button } from '../components/ui/Button';
>>>>>>> pull-1

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
<<<<<<< HEAD
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAllergen, setSelectedAllergen] = useState('');
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [selectedDietary, setSelectedDietary] = useState('');
  const [selectedThermal, setSelectedThermal] = useState('');
  const [selectedQualityScheme, setSelectedQualityScheme] = useState('');
=======
>>>>>>> pull-1
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [catalogueOrigin, setCatalogueOrigin] = useState<StatusOrigin | null>(null);

<<<<<<< HEAD
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
=======
  const getFoodImage = (foodName: string) => {
    const name = foodName.toLowerCase();
    if (name.includes('chocolate') || name.includes('praline') || name.includes('truffle')) {
      return '/images/belgian_chocolates.png';
    }
    if (name.includes('oil') || name.includes('vinegar') || name.includes('balsamic')) {
      return '/images/italian_olive_oil.png';
    }
    if (name.includes('cheese') || name.includes('brie') || name.includes('manchego')) {
      return '/images/spanish_manchego.png';
    }
    if (name.includes('sausage') || name.includes('speck') || name.includes('deli') || name.includes('marzipan')) {
      return '/images/german_delicatessen.png';
    }
    return undefined;
  };

  const countries = [
    '', 'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
    'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece',
    'Hungary', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg',
    'Malta', 'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia',
    'Slovenia', 'Spain', 'Sweden',
  ];

  const performSearch = useCallback(async () => {
    setLoading(true);
    // Graceful degradation: If offline, immediately use cached results
    if (!navigator.onLine) {
      try {
        const cachedResults = localStorage.getItem('search_fallback');
        if (cachedResults) {
          const parsed = JSON.parse(cachedResults);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setFoods(parsed);
            setLoading(false);
            return;
          }
        }
      } catch (cacheError) {
        console.warn('Could not read cached search results while offline:', cacheError);
      }
      // No cache available offline
      setFoods([
        { 
          id: 'offline-fallback', 
          name: 'Offline Mode', 
          country: 'EU', 
          price: 0.00, 
          description: 'You are currently offline. Search results are limited to cached data. Please reconnect to see the latest products.', 
          sellerId: 'system-offline' 
        },
      ]);
      setLoading(false);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      const result: any = await foodAPI.search(searchQuery, selectedCountry, page, 20, { signal: controller.signal });
      clearTimeout(timeoutId);
      const foodsArray = Array.isArray(result) ? result : (result?.data || result?.foods || []);
      setFoods(foodsArray);
      // Cache successful results for graceful degradation
      try {
        localStorage.setItem('search_fallback', JSON.stringify(foodsArray));
        // Also store timestamp for cache freshness
        localStorage.setItem('search_fallback_timestamp', Date.now().toString());
      } catch (cacheError) {
        console.warn('Could not cache search results:', cacheError);
      }
    } catch (error: any) {
      console.error('Search failed:', error);
      // Graceful degradation: Use cached results from localStorage if available
      try {
        const cachedResults = localStorage.getItem('search_fallback');
        const cachedTimestamp = localStorage.getItem('search_fallback_timestamp');
        const isCacheFresh = cachedTimestamp && (Date.now() - Number(cachedTimestamp)) < 30 * 60 * 1000; // 30 minutes
        if (cachedResults && isCacheFresh) {
          const parsed = JSON.parse(cachedResults);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setFoods(parsed);
            return;
          }
        }
      } catch (cacheError) {
        console.warn('Could not read cached search results:', cacheError);
      }
      
      // Ultimate fallback: show user-friendly message and minimal data
      setFoods([
        { 
          id: 'fallback-1', 
          name: 'Sample Product', 
          country: 'EU', 
          price: 19.99, 
          description: 'Search services are temporarily unavailable. Please try again later or check your connection.', 
          sellerId: 'system-fallback' 
        },
      ]);
>>>>>>> pull-1
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCountry, selectedCategory, selectedAllergen, minPrice, maxPrice, selectedDietary, selectedThermal, selectedQualityScheme, page]);

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      performSearch();
<<<<<<< HEAD
    }, DEBOUNCE_DELAY_MS); // Debounce search input
=======
    }, 400);
>>>>>>> pull-1

    return () => clearTimeout(delayTimer);
  }, [performSearch]);

  const handleAddToCart = (id: string) => {
    try {
<<<<<<< HEAD
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
=======
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existing = cart.find((item: any) => item.id === id);
      if (existing) {
        existing.quantity += 1;
      } else {
        const item = foods.find((f) => f.id === id);
        if (item) {
          cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            country: item.country,
            quantity: 1,
            sellerId: item.sellerId,
            finderFee: item.finderFee || 5.00
          });
        }
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
>>>>>>> pull-1
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
<<<<<<< HEAD
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

=======
          Search trusted marketplace listings by name or country and discover small-batch products from verified European sellers.
        </p>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-sm mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  setPage(1);
                }}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition"
              />
            </div>

>>>>>>> pull-1
            <div>
              <label htmlFor="country-select" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Origin Country
              </label>
              <select
                id="country-select"
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
<<<<<<< HEAD
                  setPage(1); // Reset page on country change
                }}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent text-sm transition text-gray-800 dark:text-gray-200"
              >
                {EU_COUNTRIES.map((country) => (
=======
                  setPage(1);
                }}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition"
              >
                {countries.map((country) => (
>>>>>>> pull-1
                  <option key={country} value={country}>
                    {country || 'All Countries (EU member states only)'}
                  </option>
                ))}
              </select>
<<<<<<< HEAD
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
              <div className="grid grid-cols-2 gap-2">
                {EU_ALLERGENS.filter(a => a).map((allergen) => (
                  <label key={allergen} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedAllergen.split(',').includes(allergen)}
                      onChange={() => {
                        const allergens = selectedAllergen ? selectedAllergen.split(',') : [];
                        const newAllergens = allergens.includes(allergen)
                          ? allergens.filter((a) => a !== allergen)
                          : [...allergens, allergen];
                        setSelectedAllergen(newAllergens.join(','));
                        setPage(1);
                      }}
                      className="rounded border-gray-300 dark:border-gray-600 text-brand-green focus:ring-brand-green"
                    />
                    <span className="text-sm text-gray-800 dark:text-gray-200">{allergen}</span>
                  </label>
                ))}
              </div>
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
=======
>>>>>>> pull-1
            </div>
          </div>
        </div>

<<<<<<< HEAD
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
=======
        {/* Results */}
>>>>>>> pull-1
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
<<<<<<< HEAD
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
=======
>>>>>>> pull-1
          </div>
        ) : foods.length > 0 ? (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
<<<<<<< HEAD
              {foods[0]?.id?.startsWith('offline-fallback')
=======
              {foods[0]?.id?.startsWith('fallback-') 
                ? 'Search service is currently limited. Showing sample product.' 
                : foods[0]?.id?.startsWith('offline-fallback')
>>>>>>> pull-1
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
<<<<<<< HEAD
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
=======
                  imageUrl={getFoodImage(food.name)}
                  allergens={food.allergens || []}
                  seller={{
                    name: 'Producer',
                    rating: 5.0,
                    verified: true,
                  }}
                  onAddToCart={handleAddToCart}
>>>>>>> pull-1
                />
              ))}
            </div>

<<<<<<< HEAD
            {/* Pagination Controls */}
=======
            {/* Pagination */}
>>>>>>> pull-1
            <div className="flex justify-center items-center gap-4 mt-12">
              <Button
                variant="secondary"
                size="sm"
<<<<<<< HEAD
                onClick={() => setPage(prevPage => Math.max(1, prevPage - 1))}
=======
                onClick={() => setPage(Math.max(1, page - 1))}
>>>>>>> pull-1
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
<<<<<<< HEAD
                onClick={() => setPage(prevPage => prevPage + 1)}
=======
                onClick={() => setPage(page + 1)}
>>>>>>> pull-1
              >
                Next
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-8">
<<<<<<< HEAD
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
              No results match your filters.
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
              Try removing a filter — for example, clear the allergen exclusion or broaden the country.
=======
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">
              No foods found for the current query or filters.
>>>>>>> pull-1
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

