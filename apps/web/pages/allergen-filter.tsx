import { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import AllergenFilter from '../components/marketplace/AllergenFilter';
import OriginFilter from '../components/marketplace/OriginFilter';
import EnhancedProductCard from '../components/marketplace/EnhancedProductCard';
import { foodAPI } from '../lib/services';
import type { StatusOrigin } from '../lib/degradation';

/**
 * Allergen & Filter Page - Demonstrates Task 15 requirements
 * Interactive EU Allergen & Origin Filter Engine
 */
export default function AllergenFilterPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]);

  // Load products on mount (client-side only to avoid SSR issues)
  // In a real app, this would use useEffect, but keeping it simple for demo
  if (typeof window !== 'undefined' && products.length === 0) {
    fetchInitialData();
  }

  async function fetchInitialData() {
    try {
      setLoading(true);
      const result = await foodAPI.searchWithOrigin(undefined, undefined, 1, 50);
      setProducts(result.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load products. Using demonstration data.');
      setLoading(false);
    }
  }

  // Filter products based on selected allergens and origins
  const filteredProducts = products.filter(product => {
    // If origins are selected, check if the product's country is in the selectedOrigins
    const originMatch =
      selectedOrigins.length === 0 ||
      selectedOrigins.includes(product.country ?? '');
    // If allergens are selected, check if the product contains at least one of the selected allergens
    const allergenMatch =
      selectedAllergens.length === 0 ||
      selectedAllergens.some(allergen =>
        (product.allergens || []).includes(allergen)
      );
    return originMatch && allergenMatch;
  });

  // Handle loading state
  if (loading && products.length === 0) {
    return (
      <PageWrapper>
        <div className="flex min-h-[80vh] items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-dark mb-4"></div>
            <p>Loading allergen filter demo...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // Handle error state
  if (error && products.length === 0) {
    return (
      <PageWrapper>
        <div className="py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-6">
              <span className="text-4xl text-red-400 mb-3 block">⚠️</span>
              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
                Unable to Load Products
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-brand-dark text-white rounded-xl font-medium hover:bg-brand-dark/80 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // Main content
  return (
    <PageWrapper>
      {/* Header */}
      <header className="mb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold text-brand-dark dark:text-white font-display mb-2">
            Allergen & Origin Filter Explorer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Interactive demonstration of Task 15: Interactive EU Allergen & Origin Filter Engine
          </p>

          {/* Origin indicator */}
          {origin != null && (
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium">
              {origin === 'demo' && (
                <span className="flex items-center gap-2">
                  <span aria-hidden="true">🧪</span>
                  <span className="bg-green-100 text-green-800">Demonstration Catalogue</span>
                </span>
              )}
              {origin === 'live' && (
                <span className="flex items-center gap-2">
                  <span aria-hidden="true">🌐</span>
                  <span className="bg-blue-100 text-blue-800">Live Marketplace</span>
                </span>
              )}
              {origin === 'offline' && (
                <span className="flex items-center gap-2">
                  <span aria-hidden="true">📴</span>
                  <span className="bg-red-100 text-red-800">Offline Mode</span>
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Instructions */}
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-950/50 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <span className="text-2xl text-brand-dark dark:text-white">ℹ️</span>
            </div>
            <div>
              <h3 className="font-semibold text-brand-dark dark:text-white mb-2">How to use this demo</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>1.</strong> Click on any allergen button below to select it.<br/>
                <strong>2.</strong> Selected allergens will show products that contain those allergens.<br/>
                <strong>3.</strong> Multiple allergens can be selected (OR logic).<br/>
                <strong>4.</strong> Product cards show dietary badges (PDO/PGI, Gluten-Free, Organic when available).<br/>
                <strong>5.</strong> Hover over allergens for detailed explanations.
              </p>
            </div>
          </div>
        </div>

        {/* Origin Filter */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-brand-dark dark:text-white mb-4">
            Select Origin Countries to Filter Products
          </h2>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            Currently showing: {selectedOrigins.length > 0
              ? `Products from ${selectedOrigins.length} selected origin${selectedOrigins.length > 1 ? 's' : ''}`
              : 'All products (no origin filters applied)'}
          </p>

          <OriginFilter
            onSelectOrigin={setSelectedOrigins}
            selectedOrigins={selectedOrigins}
          />
        </div>

        {/* Allergen Filter */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-brand-dark dark:text-white mb-4">
            Select Allergens to Filter Products
          </h2>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            Currently showing: {selectedAllergens.length > 0
              ? `Products containing ${selectedAllergens.length} selected allergen${selectedAllergens.length > 1 ? 's' : ''}`
              : 'All products (no filters applied)'}
          </p>

          <AllergenFilter
            products={products}
            onSelectAllergen={setSelectedAllergens}
            selectedAllergens={selectedAllergens}
          />
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-brand-dark dark:text-white">
              Products ({filteredProducts.length} of ${products.length} matching)
            </h2>
            {selectedAllergens.length > 0 && (
              <button
                onClick={() => setSelectedAllergens([])}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>
          {(selectedAllergens.length > 0 || selectedOrigins.length > 0) && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Showing products that
              {selectedOrigins.length > 0 && (
                <>
                  are from the selected origin{selectedOrigins.length > 1 ? 's' : ''}
                  {selectedAllergens.length > 0 && ' and'}
                </>
              )}
              {selectedAllergens.length > 0 && (
                <>
                  {selectedOrigins.length > 0 && ' '}
                  contain any of the selected allergen{selectedAllergens.length > 1 ? 's' : ''}
                </>
              )}
            </p>
          )}
        </div>

        {/* Render products or appropriate message */}
        {filteredProducts.length === 0 ? (
          // Show message when no products match filters
          <div className="text-center py-12">
            {selectedAllergens.length > 0 ? (
              <>
                <div className="mb-4">
                  <span className="text-4xl text-gray-400 mb-3 block">🔍</span>
                  <h3 className="font-bold text-gray-600 dark:text-gray-300 mb-2">
                    No Products Matching Filters
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Try different allergen combinations or clear filters to see all products.
                  </p>
                </div>
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => setSelectedAllergens([])}
                    className="px-5 py-3 bg-brand-dark text-white rounded-xl font-medium hover:bg-brand-dark/80 transition-colors"
                  >
                    Show All Products
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <span className="text-4xl text-gray-400 mb-3 block">📦</span>
                  <h3 className="font-bold text-gray-600 dark:text-gray-300 mb-2">
                    No Products Available
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    The product catalog appears to be empty.
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          // Show grid of filtered products
          <div className="gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product, index) => {
              const itemId = product.id ?? `product-${index}`;
              return (
                <div key={itemId}>
                  <EnhancedProductCard
                    id={itemId}
                    name={product.name || 'Unknown Product'}
                    description={product.description || ''}
                    price={product.price || 0}
                    country={product.country || 'Unknown'}
                    imageUrl={product.imageUrl}
                    allergens={product.allergens || []}
                    dietaryRestrictions={product.dietaryRestrictions || []}
                    qualityScheme={product.qualityScheme}
                    seller={{
                      name: product.seller?.name || 'Seller not available',
                      rating: product.seller?.rating ?? 0,
                      verified: product.seller?.verified === true
                    }}
                    averageRating={product.seller?.rating}
                    onAddToCart={() => {
                      console.log(`Adding ${product.name} to cart`);
                    }}
                    origin={origin}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}