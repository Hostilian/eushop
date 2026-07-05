import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { authAPI, User } from '../lib/services'; // Updated import

export default function BecomeSeller() {
  const [user, setUser] = useState<User | null>(null);
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

  const [loading, setLoading] = useState(true); // Initial loading for user fetch
  const [submitting, setSubmitting] = useState(false); // Separate loading for form submission
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const currentUser = await authAPI.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setFormData(prev => ({
            ...prev,
            email: currentUser.email,
            country: currentUser.country,
            // Pre-fill other fields if available on user object
          }));
        } else {
          router.push('/login'); // Redirect to login if not authenticated
        }
      } catch (error) {
        console.error('Failed to fetch user for seller application:', error);
        router.push('/login'); // Redirect on error
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('User not authenticated.');
      return;
    }

    // Manual validation for the two mandatory checkboxes
    if (!formData.selfCertification || !formData.acceptTerms) {
      setError('You must self-certify your compliance and accept the Terms of Service before applying.');
      return;
    }

    setSubmitting(true);

    try {
      await authAPI.becomeSeller(user.id, {
        taxId: formData.taxId,
        vatNumber: formData.vatNumber,
        tradeRegisterNumber: formData.businessRegistrationNumber,
        addressStreet: formData.addressStreet,
        addressCity: formData.addressCity,
        addressPostalCode: formData.addressPostalCode,
        selfCertifiedCompliant: formData.selfCertification,
        businessName: formData.businessName,
        country: formData.country,
        phone: formData.phone,
      });

      // Update local user state and localStorage after successful submission
      const updatedUser = { ...user, role: 'SELLER' };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser)); // Update local storage for immediate reflection

      alert('Application submitted! Your merchant profile is created and pending admin review.');
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Failed to become seller:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Should have redirected to login
  }

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
                  value={formData.businessName}
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
                  value={formData.country}
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
                  value={formData.email}
                  disabled // Email should be pre-filled from user's account
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
                  value={formData.phone}
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
                    value={formData.businessRegistrationNumber}
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
                      value={formData.taxId}
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
                      value={formData.vatNumber}
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
                      value={formData.addressStreet}
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
                      value={formData.addressCity}
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
                    value={formData.addressPostalCode}
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      className="mt-1 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                      onChange={(e) => setFormData({ ...formData, selfCertification: e.target.checked })}
                      checked={formData.selfCertification}
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
                  className="rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                  onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                  checked={formData.acceptTerms}
                />
                <span className="ml-2 text-sm text-gray-700">
                  I agree to the <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition"
            >
              {submitting ? 'Submitting...' : 'Apply to Become a Seller'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

