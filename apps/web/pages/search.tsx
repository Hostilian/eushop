import { useEffect, useState } from 'react';

interface Food {
  id: string;
  name: string;
  country: string;
  price: number;
  description: string;
  imageUrl?: string;
}

export default function SearchPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<string[]>([]);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (search || country) {
        searchFoods();
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [search, country]);

  const fetchCountries = async () => {
    try {
      // TODO: Replace with actual API call
      const mockCountries = ['Belgium', 'Italy', 'Switzerland', 'Germany', 'France', 'Spain', 'Netherlands', 'Austria'];
      setCountries(mockCountries);
    } catch (error) {
      console.error('Failed to fetch countries:', error);
    }
  };

  const searchFoods = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call to /api/foods
      const mockFoods: Food[] = [
        {
          id: '1',
          name: 'Belgian Chocolate Truffles',
          country: 'Belgium',
          price: 24.99,
          description: 'Authentic Belgian dark chocolate truffles',
          imageUrl: '/images/chocolate.png',
        },
        {
          id: '2',
          name: 'Italian Balsamic Vinegar',
          country: 'Italy',
          price: 34.99,
          description: '25-year aged Modena balsamic',
          imageUrl: '/images/balsamic.png',
        },
      ];
      setFoods(mockFoods);
    } catch (error) {
      console.error('Failed to search foods:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <a href="/" className="text-2xl font-bold text-indigo-600">🍫 EUshop</a>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Search Specialty Foods</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="e.g., chocolate, liverwurst, truffle..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Countries</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foods.map((food) => (
              <div key={food.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {food.imageUrl ? (
                    <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">🍫</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{food.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{food.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">{food.country}</span>
                    <span className="text-xl font-bold text-indigo-600">€{food.price}</span>
                  </div>
                  <button className="w-full mt-4 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {foods.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Start typing to search for specialty foods</p>
          </div>
        )}
      </main>
    </div>
  );
}
