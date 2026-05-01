
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { foodAPI } from '../lib/services';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [trendingFoods, setTrendingFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setIsLoggedIn(true);
        setUserName(userData.name);
      } catch (error) {
        console.error('Failed to parse user:', error);
      }
    }

    // Fetch trending foods
    const fetchTrending = async () => {
      try {
        const foods = await foodAPI.getTrending();
        setTrendingFoods(foods.foods || foods || []);
      } catch (error) {
        console.error('Failed to fetch trending foods:', error);
        // Use mock data as fallback
        setTrendingFoods([
          { id: '1', name: 'Belgian Chocolates', country: 'Belgium', price: 24.99 },
          { id: '2', name: 'Italian Balsamic', country: 'Italy', price: 34.99 },
          { id: '3', name: 'Swiss Emmental', country: 'Switzerland', price: 44.99 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold text-indigo-600">🍫 EUshop</Link>
          
          <div className="flex gap-4 items-center">
            <Link href="/search" className="text-gray-700 hover:text-indigo-600 font-semibold">
              Browse
            </Link>
            
            {isLoggedIn ? (
              <>
                <span className="text-gray-600">Welcome, {userName}</span>
                <Link href="/dashboard" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-indigo-600 font-semibold">
                  Sign In
                </Link>
                <Link href="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-50 to-blue-100 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🍫 Discover Europe's Finest Specialty Foods
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Connect with verified sellers across the EU. Find rare, artisanal foods and support small producers.
          </p>
          
          <div className="flex justify-center gap-4">
            <Link href="/search" className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700">
              Start Exploring
            </Link>
            <Link href="/become-seller" className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50">
              Become a Seller
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose EUshop?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-5xl mb-4">🌍</div>
              <h3 className="text-xl font-bold mb-2">Pan-European</h3>
              <p className="text-gray-600">
                Access specialty foods from across the EU, from Belgium to Switzerland
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-xl font-bold mb-2">Direct Connection</h3>
              <p className="text-gray-600">
                Connect directly with sellers. Real-time messaging for seamless negotiations
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-bold mb-2">Verified Sellers</h3>
              <p className="text-gray-600">
                All sellers verified. Transparent reviews and secure transactions guaranteed
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Foods */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12">🔥 Trending Now</h2>
          
          {loading ? (
            <div className="flex justify-center">Loading trending foods...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {trendingFoods.slice(0, 3).map((food) => (
                <Link key={food.id} href={`/food/${food.id}`}>
                  <div className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer">
                    <div className="bg-gradient-to-br from-indigo-100 to-blue-100 h-48 flex items-center justify-center text-5xl">
                      🍫
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-lg mb-1">{food.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">📍 {food.country}</p>
                      <p className="text-2xl font-bold text-indigo-600">€{food.price?.toFixed(2) || 'N/A'}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join?</h2>
          <p className="text-lg mb-8">Start discovering specialty foods or become a seller today</p>
          
          <div className="flex justify-center gap-4">
            <Link href="/search" className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
              Browse Foods
            </Link>
            <Link href="/become-seller" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700">
              Sell with Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2025 EUshop. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </footer>
    </div>
  );
}
