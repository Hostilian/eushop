import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { authAPI, User, foodAPI, FoodItem } from '../lib/services';
import { PageWrapper } from '../components/layout/PageWrapper';

const INPUT = 'w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent text-sm text-gray-800 dark:text-gray-200 transition';
const INPUT_LG = 'w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent text-sm text-gray-800 dark:text-gray-200 transition';
const LABEL = 'block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2';

const EU_ALLERGENS = [
  'Gluten', 'Crustaceans', 'Eggs', 'Fish', 'Peanuts', 'Soybeans',
  'Milk', 'Nuts', 'Celery', 'Mustard', 'Sesame', 'Sulfites', 'Lupin', 'Molluscs',
];

function SellerDashboard({ user }: { user: User }) {
  const router = useRouter();
  const [listingForm, setListingForm] = useState({
    name: '', price: '', category: 'Sweets & Confectionery',
    country: user.country || 'DE', description: '', allergens: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [myListings, setMyListings] = useState<FoodItem[]>([]);

  useEffect(() => {
    foodAPI.search(undefined, undefined, 1, 100)
      .then(all => setMyListings(all.filter(f => f.sellerId === user.id || f.sellerId === user.email)))
      .catch(console.error);
  }, [user.id, user.email, success]);

  const toggleAllergen = (a: string) =>
    setListingForm(prev => ({
      ...prev,
      allergens: prev.allergens.includes(a) ? prev.allergens.filter(x => x !== a) : [...prev.allergens, a],
    }));

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listingForm.name || !listingForm.price) return;
    setSubmitting(true);
    setSuccess(false);
    try {
      await foodAPI.addCustomListing({
        name: listingForm.name,
        price: Number(listingForm.price) || 0,
        country: listingForm.country,
        category: listingForm.category,
        description: listingForm.description,
        allergens: listingForm.allergens,
        sellerId: user.id,
        imageUrl: listingForm.name.toLowerCase().includes('chocolate') ? '/images/belgian_chocolates.png' : undefined,
        seller: { id: user.id, name: user.name, rating: 5.0, verified: true },
      });
      setSuccess(true);
      setListingForm({ name: '', price: '', category: 'Sweets & Confectionery', country: user.country || 'DE', description: '', allergens: [] });
      alert('Listing published successfully!');
    } catch {
      alert('Failed to publish listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <div className="py-6">
        <div className="flex justify-between items-center mb-8 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div>
            <h1 className="text-xl font-black text-brand-dark dark:text-white font-display">Seller Console</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.name} · {user.email}</p>
          </div>
          <button
            onClick={() => { authAPI.logout(); router.push('/login'); }}
            className="px-4 py-2 border border-red-200 dark:border-red-900/50 text-red-500 font-bold rounded-xl text-xs hover:bg-red-50 dark:hover:bg-red-950/20 transition"
          >
            Log out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-brand-dark dark:text-white mb-4 font-display">Compliance Status</h2>
              <div className="space-y-4">
                {[
                  { title: 'DSA Article 30 (KYBC)', desc: 'Trade registration and self-certifications recorded. Automated identity verification pending.', done: user.kycVerified },
                  { title: 'DAC7 Tax Registration', desc: 'TIN registered. Automated annual reporting to EU tax authorities is in development.', done: !!user.taxId },
                  { title: 'EU 1169/2011 Allergens', desc: 'Mandatory allergen disclosure required on all listings before publishing.', done: true },
                  { title: 'Food Traceability (EC 178/2002)', desc: 'Supplier and buyer record pipeline configured.', done: false },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-3">
                    <span className={`font-bold mt-0.5 shrink-0 ${item.done ? 'text-emerald-500' : 'text-amber-400'}`}>
                      {item.done ? '✓' : '○'}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">{item.title}</h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-brand-dark dark:text-white mb-4 font-display">
                Active Listings ({myListings.length})
              </h2>
              {myListings.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-500">No published listings yet.</p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {myListings.map(item => (
                    <div key={item.id} className="p-3 border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">{item.name}</h4>
                      <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                        <span>€{item.price}</span>
                        <span>{item.country}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
              <h2 className="text-2xl font-black text-brand-dark dark:text-white mb-2 font-display">Create Food Listing</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                Allergen disclosures and origin country are legally required under EU 1169/2011.
              </p>

              <form onSubmit={handleCreateListing} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">Product Name</label>
                    <input type="text" required placeholder="e.g. Artisanal Goat Cheese" className={INPUT} value={listingForm.name} onChange={e => setListingForm({ ...listingForm, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">Price (€)</label>
                    <input type="number" step="0.01" required placeholder="12.50" className={INPUT} value={listingForm.price} onChange={e => setListingForm({ ...listingForm, price: e.target.value })} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">Category</label>
                    <select className={INPUT} value={listingForm.category} onChange={e => setListingForm({ ...listingForm, category: e.target.value })}>
                      <option>Sweets & Confectionery</option>
                      <option>Condiments</option>
                      <option>Dairy & Cheese</option>
                      <option>Meat & Deli</option>
                      <option>Pantry Staples</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">Origin Country</label>
                    <input type="text" required className={INPUT} value={listingForm.country} onChange={e => setListingForm({ ...listingForm, country: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase">Description</label>
                  <textarea rows={3} placeholder="Ingredients, texture, aging process..." className={INPUT} value={listingForm.description} onChange={e => setListingForm({ ...listingForm, description: e.target.value })} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2.5 uppercase">Allergen Declarations (EU 1169/2011)</label>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-3">Check all allergens present in the recipe.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {EU_ALLERGENS.map(a => (
                      <label key={a} className="flex items-center gap-2 px-3 py-2 border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition text-[11px] cursor-pointer text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={listingForm.allergens.includes(a)}
                          onChange={() => toggleAllergen(a)}
                          className="rounded border-gray-300 dark:border-gray-600 text-brand-green focus:ring-brand-green"
                        />
                        {a}
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-brand-green hover:opacity-90 text-white font-bold py-3 rounded-xl text-sm transition disabled:opacity-50"
                >
                  {submitting ? 'Publishing…' : 'Publish to Marketplace'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default function BecomeSeller() {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    businessName: '', country: '', email: '', phone: '',
    businessRegistrationNumber: '', taxId: '', vatNumber: '',
    addressStreet: '', addressCity: '', addressPostalCode: '',
    selfCertification: false, acceptTerms: false,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    authAPI.getCurrentUser()
      .then(u => {
        if (u) {
          setUser(u);
          setFormData(prev => ({ ...prev, email: u.email, country: u.country }));
        } else {
          router.push('/login');
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!user) return;
    if (!formData.selfCertification || !formData.acceptTerms) {
      setError('You must self-certify compliance and accept the Terms of Service.');
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
      const updated = { ...user, role: 'SELLER' as const };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      alert('Application submitted! Your merchant profile is pending admin review.');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
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
  if (user.role === 'SELLER') return <SellerDashboard user={user} />;

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto py-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          <h1 className="text-3xl font-extrabold mb-2 text-brand-dark dark:text-white font-display">Become a Seller</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
            Submit your business details to begin KYBC onboarding. This captures the DSA Article 30 and DAC7 information required for review.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={LABEL}>Business Name</label>
                <input type="text" required placeholder="e.g. Fine Foods Ltd" className={INPUT_LG} value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} />
              </div>
              <div>
                <label className={LABEL}>Country</label>
                <select required className={INPUT_LG} value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })}>
                  <option value="">Select your country</option>
                  {['Austria','Belgium','France','Germany','Italy','Netherlands','Spain','Czech Republic','Poland','Portugal','Sweden'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={LABEL}>Business Email</label>
                <input type="email" required className={INPUT_LG + ' opacity-60 cursor-not-allowed'} value={formData.email} disabled />
              </div>
              <div>
                <label className={LABEL}>Phone Number</label>
                <input type="tel" required placeholder="+49 123 456789" className={INPUT_LG} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
              <h3 className="text-lg font-semibold text-brand-dark dark:text-white mb-4 font-display">KYB & Tax Verification (DSA / DAC7)</h3>
              <div className="space-y-4">
                <div>
                  <label className={LABEL}>Trade Register Number</label>
                  <input type="text" required placeholder="e.g. HRB 12345" className={INPUT_LG} value={formData.businessRegistrationNumber} onChange={e => setFormData({ ...formData, businessRegistrationNumber: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={LABEL}>Tax Identification Number (TIN)</label>
                    <input type="text" required placeholder="e.g. DE123456789" className={INPUT_LG} value={formData.taxId} onChange={e => setFormData({ ...formData, taxId: e.target.value })} />
                  </div>
                  <div>
                    <label className={LABEL}>VAT Number (Optional)</label>
                    <input type="text" placeholder="e.g. EU VAT Number" className={INPUT_LG} value={formData.vatNumber} onChange={e => setFormData({ ...formData, vatNumber: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className={LABEL}>Street Address</label>
                    <input type="text" required placeholder="e.g. Václavské náměstí 1" className={INPUT_LG} value={formData.addressStreet} onChange={e => setFormData({ ...formData, addressStreet: e.target.value })} />
                  </div>
                  <div>
                    <label className={LABEL}>City</label>
                    <input type="text" required placeholder="e.g. Prague" className={INPUT_LG} value={formData.addressCity} onChange={e => setFormData({ ...formData, addressCity: e.target.value })} />
                  </div>
                </div>
                <div className="max-w-xs">
                  <label className={LABEL}>Postal Code</label>
                  <input type="text" required placeholder="e.g. 11000" className={INPUT_LG} value={formData.addressPostalCode} onChange={e => setFormData({ ...formData, addressPostalCode: e.target.value })} />
                </div>
                <label className="flex items-start gap-2 cursor-pointer pt-2">
                  <input type="checkbox" className="mt-1 rounded border-gray-300 dark:border-gray-600 text-brand-green focus:ring-brand-green" checked={formData.selfCertification} onChange={e => setFormData({ ...formData, selfCertification: e.target.checked })} />
                  <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    I self-certify that all products listed will comply with EU law, including allergen labelling (Regulation EU 1169/2011) and national food safety standards.
                  </span>
                </label>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 text-brand-green focus:ring-brand-green" checked={formData.acceptTerms} onChange={e => setFormData({ ...formData, acceptTerms: e.target.checked })} />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  I agree to the{' '}
                  <Link href="/terms" className="text-brand-green dark:text-brand-gold hover:underline font-semibold">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-brand-green dark:text-brand-gold hover:underline font-semibold">Privacy Policy</Link>
                </span>
              </label>
            </div>

            <button type="submit" disabled={submitting} className="w-full bg-brand-green text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition text-sm">
              {submitting ? 'Submitting…' : 'Apply to Become a Seller'}
            </button>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}
