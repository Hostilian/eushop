import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { foodAPI } from '../lib/services';

interface Food {
  id: string;
  name: string;
  country: string;
  price: number;
  description: string;
}

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const countries = [
    '', 'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
    'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece',
    'Hungary', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg',
    'Malta', 'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia',
    'Slovenia', 'Spain', 'Sweden', 'Switzerland',
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
        { id: '3', name: 'Swiss Emmental', country: 'Switzerland', price: 44.99, description: 'Traditional Swiss cheese' },
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
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-indigo-600">🍫 EUshop</Link>
          <Link href="/dashboard" className="text-indigo-600 hover:underline">Dashboard</Link>
        </div>
      </div>

      {/* Search Section */}
      <section className="bg-gradient-to-br from-indigo-50 to-blue-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">🔍 Find Specialty Foods</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
            <p className="text-gray-600">Searching...</p>
          </div>
        ) : foods.length > 0 ? (
          <>
            <p className="text-gray-600 mb-6">Found {foods.length} results</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {foods.map((food) => (
                <Link key={food.id} href={`/food/${food.id}`}>
                  <div className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer overflow-hidden">
                    <div className="bg-gradient-to-br from-indigo-100 to-blue-100 h-40 flex items-center justify-center text-4xl">
                      🍫
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-1 truncate">{food.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">📍 {food.country}</p>
                      <p className="text-gray-700 text-sm mb-3 line-clamp-2">{food.description}</p>
                      <p className="text-xl font-bold text-indigo-600">€{food.price.toFixed(2)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-4 mt-12">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-6 py-2 text-gray-700">Page {page}</span>
              <button
                onClick={() => setPage(page + 1)}
                className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No foods found</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCountry('');
                setPage(1);
              }}
              className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
