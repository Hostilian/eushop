import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (error) {
        console.error('Failed to parse user:', error);
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-indigo-600">🍫 EUshop</Link>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Welcome Card */}
          <div className="md:col-span-3 bg-white rounded-lg shadow p-6">
            <h1 className="text-3xl font-bold mb-2">Welcome, {user.name}!</h1>
            <p className="text-gray-600">
              Email: {user.email} | Role: {user.role}
            </p>
            <p className="text-gray-600 mt-4">
              You are now logged in and connected to the EUshop marketplace.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <Link
              href="/search"
              className="block w-full bg-indigo-600 text-white py-2 rounded text-center hover:bg-indigo-700 mb-2"
            >
              Browse Foods
            </Link>
            <Link
              href="/become-seller"
              className="block w-full bg-green-600 text-white py-2 rounded text-center hover:bg-green-700"
            >
              Create Listing
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-bold mb-2">Discover Foods</h3>
            <p className="text-gray-600 text-sm">Find specialty foods from across Europe</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl mb-3">💬</div>
            <h3 className="font-bold mb-2">Connect</h3>
            <p className="text-gray-600 text-sm">Message sellers in real-time</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl mb-3">⭐</div>
            <h3 className="font-bold mb-2">Trust & Safety</h3>
            <p className="text-gray-600 text-sm">Verified sellers and secure transactions</p>
          </div>
        </div>
      </main>
    </div>
  );
}
