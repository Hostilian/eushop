import { useCallback, useEffect, useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { ProductCard } from '../components/ui/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { foodAPI, FoodItem } from '../lib/services';
import { Button } from '../components/ui/Button';

// --- Constants for better readability and maintainability ---
const SEARCH_TIMEOUT_MS = 8000; // 8-second timeout for API calls
const CACHE_FRESHNESS_MS = 30 * 60 * 1000; // 30 minutes for cache freshness
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

const EU_ALLERGENS = [
  '', 'Celery', 'Cereals containing gluten', 'Crustaceans', 'Eggs', 'Fish', 'Lupin', 'Milk', 'Molluscs', 'Mustard', 'Nuts', 'Peanuts', 'Sesame seeds', 'Soya', 'Sulphur dioxide and sulphites'
];

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
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

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
      // No cache available offline or cache read failed
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
      const timeoutId = setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS);
      
      const result: any = await foodAPI.search(
        searchQuery,
        selectedCountry,
        page,
        PAGE_SIZE,
        selectedCategory,
        selectedAllergen,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      
      // Ensure result is an array of FoodItem
      const foodsArray = Array.isArray(result) ? result : (result?.data || result?.foods || []);
      setFoods(foodsArray);

      // Cache successful results for graceful degradation
      try {
        localStorage.setItem('search_fallback', JSON.stringify(foodsArray));
        localStorage.setItem('search_fallback_timestamp', Date.now().toString());
      } catch (cacheError) {
        console.warn('Could not cache search results:', cacheError);
      }
    } catch (err: any) {
      console.error('Search failed:', err);
      setError('Search service is temporarily unavailable. Please try again later.');
      
      // Graceful degradation: Use cached results from localStorage if available and fresh
      try {
        const cachedResults = localStorage.getItem('search_fallback');
        const cachedTimestamp = localStorage.getItem('search_fallback_timestamp');
        const isCacheFresh = cachedTimestamp && (Date.now() - Number(cachedTimestamp)) < CACHE_FRESHNESS_MS;
        
        if (cachedResults && isCacheFresh) {
          const parsed = JSON.parse(cachedResults);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setFoods(parsed);
            return;
          }
        }
      } catch (cacheError) {
        console.warn('Could not read cached search results during error fallback:', cacheError);
      }
      
      // Ultimate fallback: show minimal data
      setFoods([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCountry, selectedCategory, selectedAllergen, page]);

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      performSearch();
    }, DEBOUNCE_DELAY_MS); // Debounce search input

    return () => clearTimeout(delayTimer);
  }, [performSearch]);

  const handleAddToCart = (id: string) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
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
      localStorage.setItem('cart', JSON.stringify(cart));
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
          Search trusted marketplace listings by name or country and discover small-batch products from verified European sellers.
        </p>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-sm mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  imageUrl={getFoodImage(food.name)}
                  allergens={food.allergens || []}
                  seller={{
                    name: food.seller?.name || 'Producer',
                    rating: food.seller?.rating || 5.0,
                    verified: food.seller?.verified ?? true,
                  }}
                  onAddToCart={handleAddToCart}
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
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">
              No foods found for the current query or filters.
            </p>
            <Button
              variant="primary"
              onClick={() => {
                setSearchQuery('');
                setSelectedCountry('');
                setSelectedCategory('');
                setSelectedAllergen('');
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
