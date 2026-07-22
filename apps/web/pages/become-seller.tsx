<<<<<<< HEAD
import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Button } from '../components/ui/Button';

export default function BecomeSellerPage() {
  const [submitted, setSubmitted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [formData, setFormData] = useState({
    businessName: '',
    tradeName: '',
    vatId: '',
    commercialRegisterNumber: '',
    registerCity: '',
    streetAddress: '',
    city: '',
    postalCode: '',
    country: 'DE',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    documentLanguage: 'de',
    needsMultilingualForm: false,
    dsaConsent: false,
=======
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { authAPI, User, foodAPI, FoodItem } from '../lib/services';

function SellerDashboard({ user }: { user: User }) {
  const router = useRouter();
  const [listingForm, setListingForm] = useState({
    name: '',
    price: '',
    category: 'Sweets & Confectionery',
    country: user.country || 'DE',
    description: '',
    allergens: [] as string[]
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [myListings, setMyListings] = useState<FoodItem[]>([]);

  const EU_ALLERGENS = [
    'Gluten', 'Crustaceans', 'Eggs', 'Fish', 'Peanuts', 'Soybeans', 
    'Milk', 'Nuts', 'Celery', 'Mustard', 'Sesame', 'Sulfites', 'Lupin', 'Molluscs'
  ];

  useEffect(() => {
    // Load seller listings from simulation
    const loadMyListings = async () => {
      try {
        const all = await foodAPI.search(undefined, undefined, 1, 100);
        setMyListings(all.filter(f => f.sellerId === user.id || f.sellerId === user.email));
      } catch (err) {
        console.error(err);
      }
    };
    loadMyListings();
  }, [user.id, user.email, success]);

  const handleCheckboxChange = (allergen: string) => {
    setListingForm(prev => {
      const active = prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen];
      return { ...prev, allergens: active };
    });
  };

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
        seller: {
          id: user.id,
          name: user.name,
          rating: 5.0,
          verified: true
        }
      });
      setSuccess(true);
      setListingForm({
        name: '',
        price: '',
        category: 'Sweets & Confectionery',
        country: user.country || 'DE',
        description: '',
        allergens: []
      });
      alert('Listing published successfully! It is now searchable in the marketplace (V2).');
    } catch (err) {
      console.error(err);
      alert('Failed to publish listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-150 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-3xl font-extrabold text-primary tracking-tight flex items-center gap-2">
            <span className="text-secondary">🌿</span> EUshop
          </Link>
          <div className="flex gap-4">
            <Link href="/" className="text-sm font-semibold text-gray-600 hover:text-primary transition py-2">
              Browse Store
            </Link>
            <button
              onClick={() => {
                authAPI.logout();
                router.push('/login');
              }}
              className="text-sm font-bold text-red-500 hover:underline py-2"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Compliance Checklist Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-brand-dark mb-4 font-display">Merchant Compliance Status</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                <div>
                  <h4 className="text-xs font-bold text-gray-800 leading-tight">DSA Article 30 (KYBC)</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">Trade registration verified and self-certifications recorded.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                <div>
                  <h4 className="text-xs font-bold text-gray-800 leading-tight">DAC7 Tax Registration</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">Tax Identification Number (TIN) registered for annual revenue sharing.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                <div>
                  <h4 className="text-xs font-bold text-gray-800 leading-tight">Regulation EU 1169/2011</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">Mandatory allergen disclosure profile activated for all food listings.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                <div>
                  <h4 className="text-xs font-bold text-gray-800 leading-tight">Food Traceability (EC 178/2002)</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">Record pipeline configured for tracking suppliers and buyers.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Listings Panel */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-brand-dark mb-4 font-display">Active Listings ({myListings.length})</h2>
            {myListings.length === 0 ? (
              <p className="text-xs text-gray-400">You have no published listings yet.</p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {myListings.map(item => (
                  <div key={item.id} className="p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition">
                    <h4 className="text-xs font-bold text-gray-800">{item.name}</h4>
                    <div className="flex justify-between items-center text-[10px] text-gray-500 mt-1">
                      <span>Price: €{item.price}</span>
                      <span>Origin: {item.country}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Listing Creator Column */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-2xl font-black text-brand-dark mb-2 font-display">Create Food Listing</h2>
            <p className="text-xs text-gray-500 mb-8 leading-relaxed">
              Publish a new specialty food item. Note that allergen disclosures and origin country are legally required fields under EU food safety laws.
            </p>

            <form onSubmit={handleCreateListing} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Artisanal Goat Cheese"
                    className="w-full px-4 py-2 border border-gray-250 bg-white rounded-xl focus:ring-2 focus:ring-primary text-xs text-gray-800"
                    value={listingForm.name}
                    onChange={e => setListingForm({ ...listingForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Price (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="12.50"
                    className="w-full px-4 py-2 border border-gray-250 bg-white rounded-xl focus:ring-2 focus:ring-primary text-xs text-gray-800"
                    value={listingForm.price}
                    onChange={e => setListingForm({ ...listingForm, price: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Category</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-250 bg-white rounded-xl focus:ring-2 focus:ring-primary text-xs text-gray-800"
                    value={listingForm.category}
                    onChange={e => setListingForm({ ...listingForm, category: e.target.value })}
                  >
                    <option>Sweets & Confectionery</option>
                    <option>Condiments</option>
                    <option>Dairy & Cheese</option>
                    <option>Meat & Deli</option>
                    <option>Pantry Staples</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Origin Country</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-250 bg-white rounded-xl focus:ring-2 focus:ring-primary text-xs text-gray-800"
                    value={listingForm.country}
                    onChange={e => setListingForm({ ...listingForm, country: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Product Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe ingredients, texture, aging process, and story..."
                  className="w-full px-4 py-2 border border-gray-250 bg-white rounded-xl focus:ring-2 focus:ring-primary text-xs text-gray-800"
                  value={listingForm.description}
                  onChange={e => setListingForm({ ...listingForm, description: e.target.value })}
                />
              </div>

              {/* Allergen Checkboxes */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2.5 uppercase">Allergen Declarations (EU 1169/2011)</label>
                <p className="text-[10px] text-gray-400 mb-3">Check all allergens contained in the recipe. Unchecked items declare the food allergen-free for that category.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {EU_ALLERGENS.map(a => (
                    <label key={a} className="flex items-center gap-2 px-3 py-2 border border-gray-150 rounded-xl hover:bg-gray-50 transition text-[11px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={listingForm.allergens.includes(a)}
                        onChange={() => handleCheckboxChange(a)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span>{a}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:opacity-90 text-white font-bold py-3 rounded-xl text-xs transition uppercase tracking-wider"
              >
                {submitting ? 'Publishing...' : 'Publish Product to Marketplace'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

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
>>>>>>> pull-1
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [demoVersion, setDemoVersion] = useState('v2');
  const router = useRouter();

  useEffect(() => {
    // 1. Initial version read
    const stored = localStorage.getItem('eushop-demo-version') || 'v2';
    setDemoVersion(stored);

    const handleVersionChange = () => {
      setDemoVersion(localStorage.getItem('eushop-demo-version') || 'v2');
    };
    window.addEventListener('demo-version-changed', handleVersionChange);

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
          }));
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Failed to fetch user for seller application:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    return () => {
      window.removeEventListener('demo-version-changed', handleVersionChange);
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
<<<<<<< HEAD
    setSubmitted(true);
=======
    setError('');

    if (!user) {
      setError('User not authenticated.');
      return;
    }

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

      const updatedUser = { ...user, role: 'SELLER' as const };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      alert('Application submitted! Your merchant profile is created and pending admin review.');
    } catch (err: any) {
      console.error('Failed to become seller:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
>>>>>>> pull-1
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
    return null;
  }

  // If the active face is V3 (Seller compliance hub) or the user role is SELLER, display listing publisher!
  if (demoVersion === 'v3' || user.role === 'SELLER') {
    return <SellerDashboard user={user} />;
  }

  return (
<<<<<<< HEAD
    <PageWrapper>
      <Head>
        <title>Become a Verified EU Seller — DSA Art. 30 Onboarding</title>
        <meta
          name="description"
          content="Cross-border EU trader registration under Digital Services Act (DSA) Article 30 with Regulation (EU) 2016/1191 document translation guidance."
        />
      </Head>

      <div className="max-w-5xl mx-auto py-8">
        {/* Header Section */}
        <div className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-green dark:text-brand-gold uppercase tracking-wider mb-2">
            <span>🇪🇺 EU Digital Services Act (DSA) Article 30 Compliance</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-display mb-3">
            Trader Onboarding & Cross-Border Identity Verification
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">
            To sell specialty goods across the EU Single Market, EU law requires verifying 5 mandatory trader identification data points before listings go live.
=======
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-3xl font-extrabold text-primary tracking-tight flex items-center gap-2">
            <span className="text-secondary">🌿</span> EUshop
          </Link>
          <Link href="/" className="text-gray-700 hover:text-primary font-semibold transition">
            Browse Store
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-extrabold mb-4 text-brand-dark font-display">Become a Seller</h1>
          <p className="text-gray-600 mb-8">
            Submit your business details to begin seller onboarding for the EU marketplace. This form captures the KYBC and DAC7 information needed for review.
>>>>>>> pull-1
          </p>
        </div>

<<<<<<< HEAD
        {/* Translation Guidance Alert (Task 70) */}
        <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
            <span>📜</span>
            <span>Regulation (EU) 2016/1191 — Cross-Border Document Translation Rules</span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            If your commercial register excerpt or ID document is issued in a language other than English or German, EU Regulation 2016/1191 allows attaching a <strong>Multilingual Standard Form (MSF)</strong> issued by your local public authority without needing costly sworn translations.
          </p>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-8 text-center space-y-4">
            <span className="text-4xl">🎉</span>
            <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-200">
              Trader Verification Application Submitted
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 max-w-xl mx-auto">
              Your trader identification data for <strong>{formData.businessName || 'EU Trader'}</strong> has been submitted to EUshop Compliance Operations. Pursuant to DSA Art. 30(2), verification takes 1-2 business days.
            </p>
            <div className="pt-2">
              <Link href="/dashboard">
                <Button variant="primary">Access Seller Dashboard</Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm space-y-8">
            {/* Section 1: Business Identity */}
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-green text-white text-xs flex items-center justify-center font-mono">1</span>
                <span>Business & Statutory Identification</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="businessName" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Legal Business Name (as registered) *
=======
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
                  placeholder="e.g. Fine Foods Ltd"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary text-gray-800"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary text-gray-850"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary bg-gray-50 text-gray-500"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  value={formData.email}
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+49 123 456789"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary text-gray-800"
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  value={formData.phone}
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-brand-dark mb-4 font-display">KYB & Tax Verification (DSA / DAC7 Compliance)</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Registration / Trade Register Number
>>>>>>> pull-1
                  </label>
                  <input
                    id="businessName"
                    required
<<<<<<< HEAD
                    type="text"
                    placeholder="e.g. Parma Delights S.r.l."
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-green"
                  />
                </div>

                <div>
                  <label htmlFor="vatId" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    EU VAT Identification Number *
                  </label>
                  <input
                    id="vatId"
                    required
                    type="text"
                    placeholder="e.g. IT12345678901"
                    value={formData.vatId}
                    onChange={(e) => setFormData({ ...formData, vatId: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-green"
                  />
                </div>

                <div>
                  <label htmlFor="commercialRegisterNumber" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Commercial Register Number (Handelsregister / R.E.A.) *
=======
                    placeholder="e.g., HRB 12345 (Germany), or equivalent"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary text-gray-800"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary text-gray-800"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary text-gray-800"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary text-gray-800"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary text-gray-800"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary text-gray-800"
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
                    <span className="ml-2 text-sm text-gray-700 font-sans leading-relaxed">
                      I self-certify that all products listed on this platform will comply with applicable rules of Union law, including allergen labeling (Regulation EU 1169/2011) and national food safety standards.
                    </span>
>>>>>>> pull-1
                  </label>
                  <input
                    id="commercialRegisterNumber"
                    required
                    type="text"
                    placeholder="e.g. HRB 98765"
                    value={formData.commercialRegisterNumber}
                    onChange={(e) => setFormData({ ...formData, commercialRegisterNumber: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-green"
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Country of Establishment *
                  </label>
                  <select
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-green"
                  >
                    <option value="DE">Germany (DE)</option>
                    <option value="IT">Italy (IT)</option>
                    <option value="FR">France (FR)</option>
                    <option value="ES">Spain (ES)</option>
                    <option value="CZ">Czech Republic (CZ)</option>
                    <option value="PL">Poland (PL)</option>
                    <option value="BE">Belgium (BE)</option>
                    <option value="NL">Netherlands (NL)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Contact & DSA Disclosures */}
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-green text-white text-xs flex items-center justify-center font-mono">2</span>
                <span>DSA Art. 30 Public Trader Disclosure</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contactName" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Trader Contact Person *
                  </label>
                  <input
                    id="contactName"
                    required
                    type="text"
                    placeholder="e.g. Giovanni Rossi"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-green"
                  />
                </div>

                <div>
                  <label htmlFor="contactEmail" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Trader Public Email *
                  </label>
                  <input
                    id="contactEmail"
                    required
                    type="email"
                    placeholder="info@parmadelights.it"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-green"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: DSA Consent */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
<<<<<<< HEAD
                  required
                  checked={formData.dsaConsent}
                  onChange={(e) => setFormData({ ...formData, dsaConsent: e.target.checked })}
                  className="mt-0.5 rounded text-brand-green focus:ring-brand-green"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  I confirm that all submitted identification data is accurate under penalty of account suspension pursuant to Digital Services Act (DSA) Article 30(3). I agree to display "Sold by {formData.businessName || 'Trader'}" on all product listings.
=======
                  className="rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                  onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                  checked={formData.acceptTerms}
                />
                <span className="ml-2 text-sm text-gray-700 font-sans">
                  I agree to the <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
>>>>>>> pull-1
                </span>
              </label>

<<<<<<< HEAD
              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary">
                  Submit Verification Data
                </Button>
              </div>
            </div>
=======
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition"
            >
              {submitting ? 'Submitting...' : 'Apply to Become a Seller'}
            </button>
>>>>>>> pull-1
          </form>
        )}
      </div>
    </PageWrapper>
  );
}
