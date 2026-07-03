import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { authAPI, User } from '../lib/services'; // Import User interface

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const currentUser = await authAPI.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          router.push('/login'); // Redirect to login if not authenticated
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        router.push('/login'); // Redirect on error
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-gray-500 font-medium">Loading dashboard...</div>;
  }

  if (!user) {
    return null; // Should redirect to login, but good to have a fallback
  }

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if API logout fails, clear local state and redirect
      localStorage.removeItem('user');
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-3xl font-extrabold text-primary tracking-tight flex items-center gap-2">
            <span className="text-secondary">🌿</span> EUshop
          </Link>
          <button
            onClick={handleLogout}
            className="bg-danger text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h1 className="text-3xl font-extrabold mb-2 text-brand-dark font-display">Welcome, {user.name}!</h1>
            <p className="text-gray-600">
              Email: {user.email} | Role: {user.role}
            </p>
            <p className="text-gray-600 mt-4">
              You are signed in to the EUshop marketplace and can continue exploring listings, seller onboarding, and checkout.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold mb-4 text-brand-dark">Quick Actions</h3>
            <Link
              href="/search"
              className="block w-full bg-primary text-white py-3 rounded-xl text-center hover:opacity-90 mb-3 font-semibold transition"
            >
              Browse Foods
            </Link>
            <Link
              href="/become-seller"
              className="block w-full bg-white text-primary py-3 rounded-xl text-center border-2 border-primary hover:bg-gray-50 font-semibold transition"
            >
              Seller Onboarding
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-bold mb-2 text-brand-dark">Discover Foods</h3>
            <p className="text-gray-600 text-sm">Find specialty foods from verified sellers across the EU marketplace.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="text-4xl mb-3">💬</div>
            <h3 className="font-bold mb-2 text-brand-dark">Connect</h3>
            <p className="text-gray-600 text-sm">Review seller details and continue conversations through the marketplace flow.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="text-4xl mb-3">⭐</div>
            <h3 className="font-bold mb-2 text-brand-dark">Trust & Safety</h3>
            <p className="text-gray-600 text-sm">Track compliance-focused onboarding and secure marketplace activity.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
