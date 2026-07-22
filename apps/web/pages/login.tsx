import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
<<<<<<< HEAD
import { PageWrapper } from '../components/layout/PageWrapper';
import { authAPI } from '../lib/services';
=======
import { authAPI } from '../lib/services'; // Updated import
>>>>>>> pull-1

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
<<<<<<< HEAD
      await authAPI.login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Login failed. Please try again.');
=======
      const result = await authAPI.login(email, password);
      console.log('Login successful:', result);
      router.push('/dashboard'); // Redirect to dashboard after successful login
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Login failed. Please try again.'); // Added err.message
      console.error('Login error:', err);
>>>>>>> pull-1
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <PageWrapper>
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 w-full max-w-md">
          <h2 className="text-3xl font-extrabold mb-2 text-brand-dark dark:text-white font-display">Sign In</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Access your marketplace account to browse, order, and manage listings.
          </p>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent text-sm transition text-gray-800 dark:text-gray-200"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent text-sm transition text-gray-800 dark:text-gray-200"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-green text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition text-sm"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
            No account?{' '}
            <Link href="/signup" className="text-brand-green dark:text-brand-gold hover:underline font-semibold">
              Sign up
            </Link>
          </p>
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-2">
            <Link href="/become-seller" className="text-brand-green dark:text-brand-gold hover:underline">
              Become a seller
            </Link>
          </p>
        </div>
=======
    <div className="min-h-screen bg-gradient-to-br from-brand-cream via-white to-brand-sand flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-extrabold text-primary tracking-tight inline-flex items-center gap-2">
            <span className="text-secondary">🌿</span> EUshop
          </Link>
        </div>

        <h2 className="text-3xl font-extrabold mb-2 text-brand-dark font-display">Sign In</h2>
        <p className="text-gray-600 mb-6">
          Access your marketplace dashboard to browse listings, manage onboarding, and continue checkout.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary hover:underline font-semibold">
            Sign up
          </Link>
        </p>

        <p className="text-center text-gray-600 mt-2">
          <Link href="/become-seller" className="text-primary hover:underline">
            Become a seller
          </Link>
        </p>
>>>>>>> pull-1
      </div>
    </PageWrapper>
  );
}
