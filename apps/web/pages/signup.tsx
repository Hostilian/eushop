import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { authAPI } from '../lib/services';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    acceptTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const countries = [
    'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
    'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece',
    'Hungary', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg',
    'Malta', 'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia',
    'Slovenia', 'Spain', 'Sweden',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.acceptTerms) {
      setError('You must accept the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      const result = await authAPI.signup(
        formData.email,
        formData.password,
        formData.name,
        formData.country
      );
      console.log('Signup successful:', result);
      router.push('/dashboard'); // Redirect to dashboard after successful signup and auto-login
    } catch (err: any) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
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
            >
              <option value="">Select your country</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

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
      </div>
    </div>
  );
}
