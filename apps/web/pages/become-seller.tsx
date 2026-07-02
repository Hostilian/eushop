import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { authAPI } from '../lib/services';

export default function BecomeSeller() {
  const [formData, setFormData] = useState({
    businessName: '',
    country: '',
    email: '',
    phone: '',
    businessRegistrationNumber: '',
    taxId: '',
    vatNumber: '',
    addressStreet: '',
    addressCity: '',
    addressPostalCode: '',
    selfCertification: false,
    acceptTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('User not logged in');
      }
      const user = JSON.parse(userStr);
      const userId = user.id;

      // Submit becomeSeller call
      await authAPI.becomeSeller(userId, {
        taxId: formData.taxId,
        vatNumber: formData.vatNumber,
        tradeRegisterNumber: formData.businessRegistrationNumber,
        addressStreet: formData.addressStreet,
        addressCity: formData.addressCity,
        addressPostalCode: formData.addressPostalCode,
        selfCertifiedCompliant: formData.selfCertification
      });

      // Update role locally
      const updatedUser = { ...user, role: 'SELLER' };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      alert('Application submitted! Your merchant profile is created.');
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Failed to become seller:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-3xl font-extrabold text-primary tracking-tight flex items-center gap-2">
            <span className="text-secondary">🌿</span> EUshop
          </Link>
          <Link href="/dashboard" className="text-gray-700 hover:text-primary font-semibold transition">
            Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-extrabold mb-4 text-brand-dark font-display">Become a Seller</h1>
          <p className="text-gray-600 mb-8">
            Submit your business details to begin seller onboarding for the EU marketplace. This form captures the KYBC and DAC7 information needed for review.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary"
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Country
                </label>
                <select
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary"
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                >
                  <option value="">Select your country</option>
                  <option value="AT">Austria</option>
                  <option value="BE">Belgium</option>
                  <option value="FR">France</option>
                  <option value="DE">Germany</option>
                  <option value="IT">Italy</option>
                  <option value="NL">Netherlands</option>
                  <option value="ES">Spain</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary"
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-brand-dark mb-4">KYB & Tax Verification (DSA / DAC7 Compliance)</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Registration / Trade Register Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., HRB 12345 (Germany), or equivalent"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary"
                    onChange={(e) => setFormData({ ...formData, businessRegistrationNumber: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tax Identification Number (TIN)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., DE123456789"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary"
                      onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      VAT Identification Number (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., EU VAT Number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary"
                      onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Václavské náměstí 1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary"
                      onChange={(e) => setFormData({ ...formData, addressStreet: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Prague"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary"
                      onChange={(e) => setFormData({ ...formData, addressCity: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 11000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary"
                    onChange={(e) => setFormData({ ...formData, addressPostalCode: e.target.value })}
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      required
                      className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                      onChange={(e) => setFormData({ ...formData, selfCertification: e.target.checked })}
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      I self-certify that all products listed on this platform will comply with applicable rules of Union law, including allergen labeling (Regulation EU 1169/2011) and national food safety standards.
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  required
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                  onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
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
              {loading ? 'Submitting...' : 'Apply to Become a Seller'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
