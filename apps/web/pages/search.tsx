import { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { PageWrapper } from '../components/layout/PageWrapper';
import { ProductCard } from '../components/ui/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { foodAPI, FoodItem } from '../lib/services';
import type { StatusOrigin } from '../lib/degradation';
import { Button } from '../components/ui/Button';
import { readCart, writeCart } from '../lib/storageSafety';
import { EU_ALLERGENS_14, type EUAllergen } from '@eushop/compliance';
import PredictiveSearch, { ParsedFilters } from '../components/PredictiveSearch';
import { PersonalFoodProfile } from '../components/personalization/PersonalFoodProfile';
import { getAnonymousPreferences, AnonymousFoodPreferences } from '../lib/personalization/userPreferences';
import { SavedStateNotification } from '../components/discovery/SavedStateNotification';
import { trackEvent } from '../lib/analytics/events';

const PAGE_SIZE = 20;
const DEBOUNCE_DELAY_MS = 300;

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

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAllergen, setSelectedAllergen] = useState('');
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [selectedDietary, setSelectedDietary] = useState('');
  const [showPersonalProfile, setShowPersonalProfile] = useState(false);
  const [userPrefs, setUserPrefs] = useState<AnonymousFoodPreferences>({});
  const [showSaveNotice, setShowSaveNotice] = useState(false);

  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [catalogueOrigin, setCatalogueOrigin] = useState<StatusOrigin | null>(null);

  // Sync initial user preferences
  useEffect(() => {
    const prefs = getAnonymousPreferences();
    setUserPrefs(prefs);
    if (prefs.deliveryCountry && !selectedCountry) {
      setSelectedCountry(prefs.deliveryCountry);
    }
  }, []);

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
        (selectedAllergen || undefined) as EUAllergen | undefined,
      );

      let foodsArray = result.data;

      // Apply price range
      if (minPrice !== null) foodsArray = foodsArray.filter(food => food.price >= minPrice);
      if (maxPrice !== null) foodsArray = foodsArray.filter(food => food.price <= maxPrice);

      // Apply dietary filter
      if (selectedDietary) {
        foodsArray = foodsArray.filter(food => food.dietaryRestrictions?.includes(selectedDietary));
      }

      // Apply user excluded allergens from Personal Food Profile
      if (userPrefs.excludedAllergens && userPrefs.excludedAllergens.length > 0) {
        foodsArray = foodsArray.filter(food => {
          if (!food.allergens) return true;
          return !userPrefs.excludedAllergens?.some(ex => food.allergens?.includes(ex as any));
        });
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
  }, [searchQuery, selectedCountry, selectedCategory, selectedAllergen, minPrice, maxPrice, selectedDietary, userPrefs, page]);

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      performSearch();
    }, DEBOUNCE_DELAY_MS);

    return () => clearTimeout(delayTimer);
  }, [performSearch]);

  const handlePredictiveSearch = (queryText: string, filters: ParsedFilters) => {
    setSearchQuery(queryText);
    if (filters.country) setSelectedCountry(filters.country);
    if (filters.category) setSelectedCategory(filters.category);
    if (filters.maxPrice) setMaxPrice(filters.maxPrice);
    if (filters.allergensAvoid && filters.allergensAvoid.length > 0) {
      setSelectedAllergen(filters.allergensAvoid[0]);
    }
  };

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
            finderFee: itemToAdd.finderFee || 5.00,
          });
        }
      }
      const result = writeCart(cart);
      if (!result.ok) throw new Error('Cart storage is unavailable.');
      window.dispatchEvent(new Event('cart-updated'));
      setShowSaveNotice(true);
      trackEvent('food_saved', { filterValue: id });
    } catch (e) {
      console.error('Failed to add to cart:', e);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCountry('');
    setSelectedCategory('');
    setSelectedAllergen('');
    setMinPrice(null);
    setMaxPrice(null);
    setSelectedDietary('');
    setPage(1);
    trackEvent('filter_cleared');
  };

  const hasActiveFilters = Boolean(
    searchQuery || selectedCountry || selectedCategory || selectedAllergen || minPrice || maxPrice || selectedDietary
  );

  return (
    <PageWrapper>
      <Head>
        <title>Search & Discover European Specialty Foods | EUshop</title>
        <meta name="description" content="Explore authentic regional delicacies from verified producers across 27 EU member states." />
      </Head>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header & Personalization Callout */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-widest text-blue-300">
              🇪🇺 European Food Graph & Discovery
            </span>
            <h1 className="text-2xl md:text-3xl font-black">
              Explore Authentic European Delicacies
            </h1>
            <p className="text-xs md:text-sm text-blue-100/80 leading-relaxed">
              Find verified regional specialties directly from artisan producers across 27 EU member states.
            </p>
          </div>

          <button
            onClick={() => setShowPersonalProfile(!showPersonalProfile)}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md font-semibold text-xs px-5 py-3 rounded-2xl transition-all flex items-center space-x-2 shadow-lg"
          >
            <span>✨</span>
            <span>{showPersonalProfile ? 'Close Food Profile' : 'Personalize Discovery'}</span>
          </button>
        </div>

        {/* Personal Food Profile Drawer */}
        {showPersonalProfile && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <PersonalFoodProfile
              onClose={() => setShowPersonalProfile(false)}
              onPreferencesChanged={(updated) => setUserPrefs(updated)}
            />
          </div>
        )}

        {/* Predictive Search Zero-State Bar */}
        <PredictiveSearch
          onSearch={handlePredictiveSearch}
          onClear={clearAllFilters}
        />

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs font-semibold text-gray-500 mr-2">Active Filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center space-x-1 text-xs bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full font-medium">
                <span>Query: "{searchQuery}"</span>
                <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-blue-600">✕</button>
              </span>
            )}
            {selectedCountry && (
              <span className="inline-flex items-center space-x-1 text-xs bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full font-medium">
                <span>Country: {selectedCountry}</span>
                <button onClick={() => setSelectedCountry('')} className="ml-1 hover:text-indigo-600">✕</button>
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center space-x-1 text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded-full font-medium">
                <span>Category: {selectedCategory}</span>
                <button onClick={() => setSelectedCategory('')} className="ml-1 hover:text-emerald-600">✕</button>
              </span>
            )}
            {selectedAllergen && (
              <span className="inline-flex items-center space-x-1 text-xs bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-full font-medium">
                <span>Excluding: {selectedAllergen}</span>
                <button onClick={() => setSelectedAllergen('')} className="ml-1 hover:text-amber-600">✕</button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs text-red-600 dark:text-red-400 hover:underline ml-2 font-medium"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Filter Controls Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs">
          <div>
            <label className="block text-gray-500 dark:text-gray-400 mb-1 font-medium">Origin Country</label>
            <select
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                trackEvent('filter_applied', { filterName: 'country', filterValue: e.target.value });
              }}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none"
            >
              <option value="">All EU Member States</option>
              {EU_COUNTRIES.filter(Boolean).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-500 dark:text-gray-400 mb-1 font-medium">Food Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                trackEvent('filter_applied', { filterName: 'category', filterValue: e.target.value });
              }}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none"
            >
              <option value="">All Categories</option>
              {FOOD_CATEGORIES.filter(Boolean).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-500 dark:text-gray-400 mb-1 font-medium">Allergen Exclusion</label>
            <select
              value={selectedAllergen}
              onChange={(e) => {
                setSelectedAllergen(e.target.value);
                trackEvent('filter_applied', { filterName: 'allergenExclusion', filterValue: e.target.value });
              }}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none"
            >
              <option value="">No Allergen Filter</option>
              {EU_ALLERGENS_14.map((alg) => (
                <option key={alg} value={alg}>Exclude {alg}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-500 dark:text-gray-400 mb-1 font-medium">Max Price (€)</label>
            <input
              type="number"
              placeholder="e.g. 50"
              value={maxPrice ?? ''}
              onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : null)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 focus:outline-none"
            />
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-red-50 dark:bg-red-950/20 rounded-3xl border border-red-200 dark:border-red-800 space-y-3">
            <p className="text-sm text-red-800 dark:text-red-300 font-semibold">{error}</p>
            <Button onClick={performSearch} size="sm" variant="outline">Retry Search</Button>
          </div>
        ) : foods.length === 0 ? (
          <div className="p-12 text-center bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-4">
            <span className="text-4xl">🔍</span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No products found matching your search</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Try resetting your filters or exploring our European Food Atlas to discover regional specialties.
            </p>
            <Button onClick={clearAllFilters} size="sm">Clear Filters</Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Showing {foods.length} European specialty products</span>
              {catalogueOrigin && <span>Source: {catalogueOrigin}</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {foods.map((food) => (
                <ProductCard
                  key={food.id}
                  id={food.id}
                  name={food.name}
                  description={food.description || ''}
                  price={food.price}
                  country={food.country}
                  seller={food.sellerId ? { name: `Artisan Seller (${food.country})`, rating: 5, verified: true } : undefined}
                  onAddToCart={() => handleAddToCart(food.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Ethical Save Notification */}
        {showSaveNotice && (
          <SavedStateNotification
            message="Item added to cart! Your cart and preferences are preserved."
            onDismiss={() => setShowSaveNotice(false)}
          />
        )}
      </div>
    </PageWrapper>
  );
}
