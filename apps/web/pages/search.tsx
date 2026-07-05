import { useCallback, useEffect, useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { ProductCard } from '../components/ui/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { foodAPI, FoodItem } from '../lib/services';
import { Button } from '../components/ui/Button';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

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
      const result = await foodAPI.search(searchQuery, selectedCountry, page, 20, { signal: controller.signal });
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
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCountry, page]);

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      performSearch();
    }, 400);

    return () => clearTimeout(delayTimer);
  }, [performSearch]);

  const handleAddToCart = (id: string) => {
    try {
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

            <div>
              <label htmlFor="country-select" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Origin Country
              </label>
              <select
                id="country-select"
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition"
              >
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country || 'All Countries (EU member states only)'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </div>
        ) : foods.length > 0 ? (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
              {foods[0]?.id?.startsWith('fallback-') 
                ? 'Search service is currently limited. Showing sample product.' 
                : foods[0]?.id?.startsWith('offline-fallback')
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
                    name: 'Producer',
                    rating: 5.0,
                    verified: true,
                  }}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-4 mt-12">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
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
                onClick={() => setPage(page + 1)}
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

