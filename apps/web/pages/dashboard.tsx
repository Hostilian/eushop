import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { authAPI, User } from '../lib/services';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await authAPI.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } finally {
      router.push('/');
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-green" />
        </div>
      </PageWrapper>
    );
  }

  if (!user) return null;

  return (
    <PageWrapper>
      <div className="py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="md:col-span-3 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
            <h1 className="text-3xl font-extrabold mb-2 text-brand-dark dark:text-white font-display">
              Welcome, {user.name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {user.email} · Role: <span className="font-semibold text-brand-green dark:text-brand-gold">{user.role}</span>
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col gap-3">
            <h3 className="text-sm font-bold text-brand-dark dark:text-white mb-1">Quick Actions</h3>
            <Link href="/search" className="block w-full bg-brand-green text-white py-2.5 rounded-xl text-center hover:opacity-90 font-semibold transition text-sm">
              Browse Foods
            </Link>
            {user.role !== 'SELLER' && (
              <Link href="/become-seller" className="block w-full border border-brand-green text-brand-green dark:text-brand-gold dark:border-brand-gold py-2.5 rounded-xl text-center hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold transition text-sm">
                Become a Seller
              </Link>
            )}
            {user.role === 'SELLER' && (
              <Link href="/become-seller" className="block w-full border border-brand-green text-brand-green dark:text-brand-gold dark:border-brand-gold py-2.5 rounded-xl text-center hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold transition text-sm">
                Seller Dashboard
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="block w-full border border-danger text-danger py-2.5 rounded-xl text-center hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold transition text-sm"
            >
              Log Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-bold mb-2 text-brand-dark dark:text-white">Discover Foods</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Find specialty foods from verified sellers across the EU marketplace.</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <div className="text-4xl mb-3">💬</div>
            <h3 className="font-bold mb-2 text-brand-dark dark:text-white">Messages</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Chat directly with sellers about products, shipping, and custom orders.</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <div className="text-4xl mb-3">🛡️</div>
            <h3 className="font-bold mb-2 text-brand-dark dark:text-white">Privacy Center</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Manage your GDPR rights — export data or request erasure.{' '}
              <Link href="/gdpr" className="text-brand-green dark:text-brand-gold hover:underline font-semibold">Open →</Link>
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
