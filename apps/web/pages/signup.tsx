import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { authAPI } from '../lib/services';

const EU_COUNTRIES = [
  'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
  'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece',
  'Hungary', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg',
  'Malta', 'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia',
  'Slovenia', 'Spain', 'Sweden',
];

const INPUT_CLS = 'w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent text-sm transition text-gray-800 dark:text-gray-200';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', country: '', acceptTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!formData.acceptTerms) {
      setError('You must accept the Terms of Service to continue.');
      return;
    }
    setLoading(true);
    try {
<<<<<<< HEAD
      await authAPI.signup(formData.email, formData.password, formData.name, formData.country);
      router.push('/dashboard');
=======
      const result = await authAPI.signup(
        formData.email,
        formData.password,
        formData.name,
        formData.country
      );
      console.log('Signup successful:', result);
      router.push('/dashboard'); // Redirect to dashboard after successful signup and auto-login
>>>>>>> pull-1
    } catch (err: any) {
      setError(err.response?.data?.error || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <PageWrapper>
      <div className="flex items-center justify-center min-h-[75vh] px-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 w-full max-w-md">
          <h2 className="text-3xl font-extrabold mb-2 text-brand-dark dark:text-white font-display">
            Create Account
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Join the marketplace to browse regional foods and apply as a seller.
          </p>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className={INPUT_CLS} placeholder="Your name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} className={INPUT_CLS} placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Country</label>
              <select name="country" value={formData.country} onChange={handleChange} className={INPUT_CLS}>
                <option value="">Select your EU country</option>
                {EU_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <input type="password" name="password" required minLength={6} value={formData.password} onChange={handleChange} className={INPUT_CLS} placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
              <input type="password" name="confirmPassword" required minLength={6} value={formData.confirmPassword} onChange={handleChange} className={INPUT_CLS} placeholder="••••••••" />
            </div>
            <div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="mt-0.5 rounded border-gray-300 dark:border-gray-600 text-brand-green focus:ring-brand-green"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  I agree to the{' '}
                  <Link href="/terms" className="text-brand-green dark:text-brand-gold hover:underline font-semibold">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-brand-green dark:text-brand-gold hover:underline font-semibold">Privacy Policy</Link>
                </span>
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-green text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition text-sm"
=======
    <div className="min-h-screen bg-gradient-to-br from-brand-cream via-white to-brand-sand py-12 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-extrabold text-primary tracking-tight inline-flex items-center gap-2">
            <span className="text-secondary">🌿</span> EUshop
          </Link>
        </div>

        <h2 className="text-3xl font-extrabold mb-2 text-brand-dark font-display">Create Account</h2>
        <p className="text-gray-600 mb-6">
          Join the marketplace to browse regional foods, save your profile, and apply as a seller later.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary"
>>>>>>> pull-1
            >
              {loading ? 'Creating account…' : 'Sign Up'}
            </button>
          </form>

<<<<<<< HEAD
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-green dark:text-brand-gold hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>
=======
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">
                I agree to the <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-semibold">
            Sign in
          </Link>
        </p>
>>>>>>> pull-1
      </div>
    </PageWrapper>
  );
}
