
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { foodAPI } from '../lib/services'; // Updated import

const fallbackTrendingFoods = [
  { id: '1', name: 'Belgian Chocolates', country: 'Belgium', price: 24.99 },
  { id: '2', name: 'Italian Balsamic', country: 'Italy', price: 34.99 },
  { id: '3', name: 'Spanish Manchego Cheese', country: 'Spain', price: 44.99 },
];

const getFoodImage = (foodName: string) => {
  const name = foodName.toLowerCase();
  if (name.includes('chocolate') || name.includes('praline') || name.includes('truffle')) {
    return '/images/belgian_chocolates.png';
  }
  if (name.includes('oil') || name.includes('vinegar') || name.includes('balsamic')) {
    return '/images/italian_olive_oil.png';
  }
  if (name.includes('cheese') || name.includes('manchego') || name.includes('tilsiter') || name.includes('bergkäse')) {
    return '/images/spanish_manchego.png';
  }
  if (name.includes('sausage') || name.includes('speck') || name.includes('deli') || name.includes('marzipan')) {
    return '/images/german_delicatessen.png';
  }
  return null;
};

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [trendingFoods, setTrendingFoods] = useState<any[]>(fallbackTrendingFoods);
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
      try {
        const foods = await foodAPI.getTrending();
        setTrendingFoods(Array.isArray(foods) ? foods : (foods?.data || foods?.foods || []));
      } catch (error) {
        console.error('Failed to fetch trending foods:', error);
        // Use mock data as fallback
        setTrendingFoods(fallbackTrendingFoods);
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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-3xl font-extrabold text-primary tracking-tight flex items-center gap-2">
            <span className="text-secondary">🌿</span> EUshop
          </Link>
          
          <div className="flex gap-6 items-center">
            <Link href="/search" className="text-gray-700 hover:text-primary font-semibold transition">
              Browse
            </Link>
            
            {isLoggedIn ? (
              <>
                <span className="text-gray-600 text-sm">Welcome, <strong className="text-primary">{userName}</strong></span>
                <Link href="/dashboard" className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 font-medium transition text-sm">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-danger text-sm transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-primary font-semibold transition text-sm">
                  Sign In
                </Link>
                <Link href="/signup" className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 font-medium transition text-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-cream via-white to-brand-sand py-24 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-brand-dark mb-6 tracking-tight leading-tight">
            Discover Europe's Finest <span className="text-primary font-display font-medium">Artisanal</span> Foods
          </h1>
          <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed">
            Connect with verified sellers across the European Union. Find rare, organic specialty foods and support small-batch producers.
          </p>
          
          <div className="flex justify-center gap-4">
            <Link href="/search" className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:opacity-95 shadow-md shadow-primary/10 transition">
              Start Exploring
            </Link>
            <Link href="/become-seller" className="bg-white text-primary px-8 py-4 rounded-xl font-bold border-2 border-primary hover:bg-gray-50 transition">
              Become a Seller
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center mb-16 text-brand-dark">Why Choose EUshop?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-md transition">
              <div className="text-4xl mb-6 text-primary">🇪🇺</div>
              <h3 className="text-xl font-bold mb-3 text-brand-dark">Pan-European</h3>
              <p className="text-gray-600 leading-relaxed">
                Access specialty foods sourced strictly from EU member states. Simple cross-border compliance.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-md transition">
              <div className="text-4xl mb-6 text-secondary">🤝</div>
              <h3 className="text-xl font-bold mb-3 text-brand-dark">Direct Connection</h3>
              <p className="text-gray-600 leading-relaxed">
                Connect directly with sellers. Real-time messaging lets you discuss batches, freshness, and shipping.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-md transition">
              <div className="text-4xl mb-6 text-success">🛡️</div>
              <h3 className="text-xl font-bold mb-3 text-brand-dark">Verified Compliance</h3>
              <p className="text-gray-600 leading-relaxed">
                All sellers are KYBC and DAC7 verified. Allergen details and food safety compliance are fully audited.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Foods */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold mb-12 text-brand-dark">🔥 Trending Now</h2>
          
          {loading ? (
            <div className="flex justify-center text-gray-500 font-medium">Loading trending foods...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {trendingFoods.slice(0, 3).map((food) => {
                const img = getFoodImage(food.name);
                return (
                  <Link key={food.id} href={`/food/${food.id}`}>
                    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 border border-gray-100 transition duration-300 overflow-hidden cursor-pointer flex flex-col h-full">
                      <div className="h-48 relative overflow-hidden bg-brand-sand flex items-center justify-center">
                        {img ? (
                          <img 
                            src={img} 
                            alt={food.name}
                            className="w-full h-full object-cover transition duration-300 hover:scale-105"
                          />
                        ) : (
                          <span className="text-5xl">🧀</span>
                        )}
                      </div>
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-lg mb-1 text-brand-dark">{food.name}</h3>
                          <p className="text-gray-500 text-sm mb-4">📍 {food.country}</p>
                        </div>
                        <p className="text-2xl font-extrabold text-primary">€{food.price?.toFixed(2) || 'N/A'}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold mb-4 font-display">Ready to Join the Marketplace?</h2>
          <p className="text-lg mb-10 text-gray-100 max-w-xl mx-auto">Start discovering specialty foods or register your business to sell with us today.</p>
          
          <div className="flex justify-center gap-4">
            <Link href="/search" className="bg-white text-primary px-8 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition shadow-md">
              Browse Foods
            </Link>
            <Link href="/become-seller" className="border-2 border-white text-white px-8 py-3.5 rounded-xl font-bold hover:bg-white/10 transition">
              Sell with Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
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
