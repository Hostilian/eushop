import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { foodAPI } from '../lib/services'; // Updated import

interface Food {
  id: string;
  name: string;
  country: string;
  price: number;
  description: string;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
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
    return null;
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
    try {
      const result = await foodAPI.search(searchQuery, selectedCountry, page, 20);
      setFoods(Array.isArray(result) ? result : (result?.data || result?.foods || []));
    } catch (error) {
      console.error('Search failed:', error);
      // Use mock data as fallback
      setFoods([
        { id: '1', name: 'Belgian Chocolates', country: 'Belgium', price: 24.99, description: 'Premium Belgian chocolates' },
        { id: '2', name: 'Italian Balsamic', country: 'Italy', price: 34.99, description: 'Aged balsamic vinegar' },
        { id: '3', name: 'French Brie Cheese', country: 'France', price: 19.99, description: 'Soft and creamy traditional French cheese' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCountry, page]);

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      performSearch();
    }, 500);

    return () => clearTimeout(delayTimer);
  }, [performSearch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-3xl font-extrabold text-primary tracking-tight flex items-center gap-2">
            <span className="text-secondary">🌿</span> EUshop
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-700 hover:text-primary font-semibold transition">
              Home
            </Link>
            <Link href="/dashboard" className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 font-medium transition text-sm">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <section className="bg-gradient-to-br from-brand-cream via-white to-brand-sand py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-extrabold text-brand-dark mb-3 font-display">
            Find Specialty Foods Across the EU
          </h1>
          <p className="text-gray-700 mb-8 max-w-2xl leading-relaxed">
            Search trusted marketplace listings by name or country and discover small-batch products from verified European sellers.
          </p>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="e.g., Belgian Chocolates, Balsamic..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Country
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country || 'All Countries'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-gray-600 font-medium">Searching curated listings...</p>
          </div>
        ) : foods.length > 0 ? (
          <>
            <p className="text-gray-600 mb-6">Found {foods.length} results</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {foods.map((food) => {
                const img = getFoodImage(food.name);
                return (
                  <Link key={food.id} href={`/food/${food.id}`}>
                    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300 cursor-pointer overflow-hidden border border-gray-100 h-full">
                      <div className="h-40 relative overflow-hidden bg-brand-sand flex items-center justify-center">
                        {img ? (
                          <img 
                            src={img} 
                            alt={food.name}
                            className="w-full h-full object-cover transition duration-300 hover:scale-105"
                          />
                        ) : (
                          <span className="text-4xl">🌿</span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-1 truncate text-brand-dark">{food.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">📍 {food.country}</p>
                        <p className="text-gray-700 text-sm mb-3 line-clamp-2">{food.description}</p>
                        <p className="text-xl font-extrabold text-primary">€{food.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-4 mt-12">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-6 py-2 text-gray-700 font-medium">Page {page}</span>
              <button
                onClick={() => setPage(page + 1)}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No foods found for the current filters</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCountry('');
                setPage(1);
              }}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:opacity-90"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>

      <footer className="bg-brand-dark text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} EUshop. All rights reserved. |{' '}
            <Link href="/privacy" className="hover:text-white transition underline">Privacy Policy</Link> |{' '}
            <Link href="/terms" className="hover:text-white transition underline">Terms of Service</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
