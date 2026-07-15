import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageWrapper } from '../components/layout/PageWrapper';
import { ProductCard } from '../components/ui/ProductCard';
import { Button } from '../components/ui/Button';
import { foodAPI, FoodItem } from '../lib/services';
import PredictiveSearch, { ParsedFilters } from '../components/PredictiveSearch';
import DiscoveryCanvas from '../components/DiscoveryCanvas';
import ZeroStepCheckout from '../components/ZeroStepCheckout';

const fallbackTrendingFoods: FoodItem[] = [
  { id: '1', name: 'Belgian Chocolates', country: 'Belgium', price: 24.99, description: 'Fine artisanal chocolates with creamy hazelnut fillings.', sellerId: 'seller-be' },
  { id: '2', name: 'Italian Balsamic', country: 'Italy', price: 34.99, description: 'Aged balsamic vinegar of Modena, rich and complex flavor.', sellerId: 'seller-it' },
  { id: '3', name: 'Spanish Manchego Cheese', country: 'Spain', price: 44.99, description: 'Cured sheep milk cheese from La Mancha region.', sellerId: 'seller-es' },
];

const getFoodImage = (foodName: string) => {
  const name = foodName.toLowerCase();
  if (name.includes('chocolate') || name.includes('praline') || name.includes('truffle')) {
    return '/images/belgian_chocolates.png';
  }
  if (name.includes('oil') || name.includes('vinegar') || name.includes('balsamic')) {
    return '/images/italian_olive_oil.png';
  }
  if (name.includes('cheese') || name.includes('manchego') || name.includes('tilsiter') || name.includes('bergkäse')) {
    return '/images/spanish_manchego.png';
  }
  if (name.includes('sausage') || name.includes('speck') || name.includes('deli') || name.includes('marzipan')) {
    return '/images/german_delicatessen.png';
  }
  return undefined;
};

function InvestorPitch() {
  const [email, setEmail] = useState('');
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const [aov, setAov] = useState(45);
  const [volume, setVolume] = useState(15000);
  const [takeRate, setTakeRate] = useState(12);

  const monthlyGMV = aov * volume;
  const annualGMV = monthlyGMV * 12;
  const monthlyRevenue = monthlyGMV * (takeRate / 100);
  const annualARR = monthlyRevenue * 12;

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    try {
      const waitlistStr = localStorage.getItem('waitlist_emails') || '[]';
      const waitlist = JSON.parse(waitlistStr);
      if (!waitlist.includes(email)) {
        waitlist.push(email);
        localStorage.setItem('waitlist_emails', JSON.stringify(waitlist));
      }
      setWaitlistSubmitted(true);
      setEmail('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PageWrapper>
      {/* Hero Pitch Section */}
      <section className="relative overflow-hidden py-16 px-6 rounded-3xl bg-gradient-to-br from-pink-50/70 via-white to-rose-50/30 dark:from-gray-955 dark:via-gray-900 dark:to-rose-950/20 border border-gray-150 dark:border-rose-950/40 shadow-sm mb-16 animate-slide-up animate-fade-in">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 mb-6">
            Pre-Seed Opportunity
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-brand-dark dark:text-white mb-6 tracking-tight leading-tight font-display">
            Unlocking Europe's <span className="text-rose-600 dark:text-rose-400">€45B</span> Artisanal Food Market
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
            EUshop is a compliance-secured, pan-European B2C & B2B marketplace. We eliminate cross-border trade barriers, automate VAT OSS filings, and enforce digital safety checks under the Digital Services Act (DSA).
          </p>

          {/* Waitlist Form */}
          <div className="max-w-md mx-auto bg-white/80 dark:bg-gray-900/80 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-md backdrop-blur-md">
            {waitlistSubmitted ? (
              <div className="text-center py-2 animate-fade-in">
                <span className="text-3xl text-emerald-500 font-bold">✓</span>
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-2">Registered Successfully!</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">We have logged your email. You can view the full waitlist in the V4 Admin Console.</p>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                <h4 className="text-xs font-bold text-brand-dark dark:text-white text-left uppercase tracking-wider">Join Pre-Seed Investor Waitlist</h4>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder="Enter investor email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent text-xs transition text-gray-800 dark:text-gray-200"
                  />
                  <button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition">
                    Register
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Financial Calculator Section */}
      <section className="py-12 mb-16">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-dark dark:text-white font-display">
            Interactive ARR Runway Calculator
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Slide the metrics to project marketplace revenue streams based on transactions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
          {/* Sliders Box */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm flex flex-col justify-between gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Average Order Value</label>
                <span className="text-sm font-bold text-rose-600 dark:text-rose-400">€{aov}</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                value={aov}
                onChange={(e) => setAov(Number(e.target.value))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>€10</span>
                <span>€200</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Monthly Orders</label>
                <span className="text-sm font-bold text-rose-600 dark:text-rose-400">{volume.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="100000"
                step="1000"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>1,000</span>
                <span>100,000</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Take Rate % (Fee)</label>
                <span className="text-sm font-bold text-rose-600 dark:text-rose-400">{takeRate}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                value={takeRate}
                onChange={(e) => setTakeRate(Number(e.target.value))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>5%</span>
                <span>25%</span>
              </div>
            </div>
          </div>

          {/* Results Box */}
          <div className="lg:col-span-3 grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-brand-sand/30 to-brand-cream/80 dark:from-gray-900 dark:to-gray-955 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-center">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Monthly GMV</span>
              <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-brand-dark dark:text-white mt-2">
                €{monthlyGMV.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            
            <div className="bg-gradient-to-br from-brand-sand/30 to-brand-cream/80 dark:from-gray-900 dark:to-gray-955 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-center">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Annual GMV</span>
              <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-brand-dark dark:text-white mt-2">
                €{annualGMV.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-gradient-to-br from-brand-sand/30 to-brand-cream/80 dark:from-gray-900 dark:to-gray-955 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-center">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Monthly Revenue</span>
              <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">
                €{monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-gradient-to-br from-rose-500 to-rose-600 dark:from-rose-900/60 dark:to-rose-800/80 border border-rose-500/20 rounded-3xl p-6 shadow-md flex flex-col justify-center text-white">
              <span className="text-xs uppercase tracking-wider font-bold opacity-80">Projected ARR</span>
              <span className="text-xl sm:text-2xl md:text-3xl font-black mt-2">
                €{annualARR.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance / Diligence Section */}
      <section className="py-12 mb-16 border-t border-gray-100 dark:border-gray-900">
        <h3 className="text-xl font-bold text-center text-brand-dark dark:text-white font-display mb-10">Pan-EU Regulatory Compliance Engine</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl">
            <span className="text-2xl">⚖</span>
            <h4 className="text-sm font-bold text-brand-dark dark:text-white mt-4 mb-2">Digital Services Act (DSA)</h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
              Automated KYBC (Know-Your-Business-Customer) onboarding flow verifying traders’ commercial status before product publication (Article 30 compliance).
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl">
            <span className="text-2xl">💶</span>
            <h4 className="text-sm font-bold text-brand-dark dark:text-white mt-4 mb-2">DAC7 Tax Reporting</h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
              Standardized collection of VAT numbers, Tax Identification Numbers (TIN), and financial records reporting seller income to EU authorities dynamically.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl">
            <span className="text-2xl">🍎</span>
            <h4 className="text-sm font-bold text-brand-dark dark:text-white mt-4 mb-2">EU 1169/2011 Food Info</h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
              Allergen disclosure engine making listing of the 14 EU-regulated food allergens mandatory, protecting consumers with complete ingredient visibility.
            </p>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}

export default function Home() {
  const [demoVersion, setDemoVersion] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('eushop-demo-version') || 'v20';
    }
    return 'v20';
  });
  const [trendingFoods, setTrendingFoods] = useState<FoodItem[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<FoodItem[]>([]);
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [selectedProductForCheckout, setSelectedProductForCheckout] = useState<FoodItem | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    // 1. Listen for switcher updates
    const handleVersionChange = () => {
      setDemoVersion(localStorage.getItem('eushop-demo-version') || 'v20');
    };
    window.addEventListener('demo-version-changed', handleVersionChange);

    // 3. Fetch trending foods
    const fetchTrending = async () => {
      setLoadingFoods(true);
      try {
        const foods: any = await foodAPI.getTrending();
        const list = Array.isArray(foods) ? foods : (foods?.data || foods?.foods || []);
        setTrendingFoods(list);
        setFilteredProducts(list);
      } catch (error) {
        console.error('Failed to fetch trending foods:', error);
        setTrendingFoods(fallbackTrendingFoods);
        setFilteredProducts(fallbackTrendingFoods);
      } finally {
        setLoadingFoods(false);
      }
    };

    fetchTrending();

    return () => {
      window.removeEventListener('demo-version-changed', handleVersionChange);
    };
  }, []);

  const handleAddToCart = (id: string) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existing = cart.find((item: any) => item.id === id);
      if (existing) {
        existing.quantity += 1;
      } else {
        const item = trendingFoods.find((f) => f.id === id);
        if (item) {
          cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            country: item.country,
            quantity: 1,
            sellerId: item.sellerId,
            finderFee: item.finderFee || 2.50
          });
        }
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
    } catch (e) {
      console.error('Failed to add to cart:', e);
    }
  };

  const handleSearch = (query: string, filters: ParsedFilters) => {
    setIsLoadingSearch(true);
    // Simulate AI parsing/search engine latency
    setTimeout(() => {
      let results = [...trendingFoods];
      if (filters.country) {
        results = results.filter(p => p.country.toLowerCase() === filters.country!.toLowerCase());
      }
      if (filters.category) {
        results = results.filter(p => p.category?.toLowerCase() === filters.category!.toLowerCase());
      }
      if (filters.maxPrice) {
        results = results.filter(p => p.price <= filters.maxPrice!);
      }
      if (filters.allergensAvoid && filters.allergensAvoid.length > 0) {
        results = results.filter(p => {
          const itemAllergens = p.allergens || [];
          return !filters.allergensAvoid!.some(avoidAllergen =>
            itemAllergens.some(a => a.toLowerCase() === avoidAllergen.toLowerCase())
          );
        });
      }
      setFilteredProducts(results);
      setIsLoadingSearch(false);
    }, 450);
  };

  const handleClearSearch = () => {
    setFilteredProducts(trendingFoods);
  };

  if (demoVersion === 'v1') {
    return <InvestorPitch />;
  }

  if (demoVersion === 'v20') {
    return (
      <PageWrapper>
        {/* V20 Luxury Artisan Hero Banner */}
        <section className="relative overflow-hidden py-20 px-6 sm:px-12 rounded-[40px] bg-gradient-to-br from-brand-green to-slate-900 text-white border border-brand-green/20 shadow-2xl mb-16 text-center animate-slide-up">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-extrabold px-4 py-1.5 rounded-full bg-brand-gold/25 text-brand-gold border border-brand-gold/30">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-ping"></span>
              V20 Relaunch • Active
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight uppercase font-display">
              Exquisite Artisanal Foods <span className="text-brand-gold">Delivered Pan-EU</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Connect directly with verified independent producers. Experience zero-friction shopping, strict EU regulatory compliance, and our new companion apps for Android &amp; iOS.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <a href="#apps" className="px-6 py-3 border border-brand-gold bg-brand-gold text-brand-green hover:opacity-90 font-bold rounded-xl text-sm transition shadow-lg shadow-brand-gold/10">
                Get the Apps
              </a>
              <a href="#explore" className="px-6 py-3 border border-gray-700 hover:bg-gray-800 text-white font-bold rounded-xl text-sm transition">
                Start Exploring
              </a>
            </div>
          </div>
        </section>

        {/* AI Predictive Search */}
        <section id="explore" className="mb-12 scroll-mt-24">
          <PredictiveSearch onSearch={handleSearch} onClear={handleClearSearch} />
        </section>

        {/* Dynamic Gourmet Discovery Canvas */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-brand-dark dark:text-white font-display">Gourmet Discovery Canvas</h2>
              <p className="text-xs text-gray-500">Double click an item or drag it to explore details.</p>
            </div>
            <span className="text-xs font-bold text-brand-gold px-3 py-1 bg-brand-gold/10 rounded-full border border-brand-gold/20">V20 Mode</span>
          </div>
          <DiscoveryCanvas
            products={filteredProducts}
            isLoading={isLoadingSearch || loadingFoods}
            onQuickCheckout={(prod) => {
              setSelectedProductForCheckout(prod);
              setIsCheckoutOpen(true);
            }}
          />
        </section>

        {/* V20 Multi-Surface Companion Apps Section */}
        <section id="apps" className="py-16 border-t border-brand-gold/10 scroll-mt-24 mb-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[10px] uppercase font-bold text-brand-gold tracking-widest px-3 py-1 bg-brand-gold/10 border border-brand-gold/20 rounded-full">Unified Ecosystem</span>
            <h2 className="text-3xl font-extrabold text-brand-dark dark:text-white font-display mt-4">
              EUshop Companion Apps
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Browse listings, chat with sellers, snap listing photos with your camera, and enjoy location-aware searches directly on your phone.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            {/* Android Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-8 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">🤖</span>
                  <span className="text-[10px] bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-md border border-green-500/30 font-bold">Release Build v2.0.0</span>
                </div>
                <h3 className="text-xl font-bold text-brand-dark dark:text-white font-display">Android Companion App</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  List specialty food items in seconds using camera integrations, receive instant push notifications, and checkout seamlessly with Google Pay and Stripe card sheets.
                </p>
                <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl flex items-center gap-4 border border-gray-100 dark:border-gray-900">
                  <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200">
                    {/* Simulated QR Code */}
                    <div className="w-16 h-16 bg-gradient-to-br from-brand-green to-slate-900 flex items-center justify-center p-1 rounded-lg">
                      <div className="w-full h-full bg-white grid grid-cols-3 gap-0.5 p-1">
                        {[...Array(9)].map((_, i) => (
                          <div key={i} className={`rounded-sm ${i % 3 === 0 || i % 4 === 1 || i === 8 ? 'bg-brand-green' : 'bg-transparent'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Scan to install APK</span>
                    <a href="https://github.com/Hostilian/eushop/releases/latest/download/eushop.apk" className="text-xs font-semibold text-brand-gold hover:underline">
                      Or download directly (eushop.apk) &rarr;
                    </a>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-gray-100 dark:border-gray-800 mt-6 flex justify-between items-center">
                <span className="text-xs text-gray-400">Target: Android 8.0+</span>
                <a href="https://github.com/Hostilian/eushop/releases/latest/download/eushop.apk" className="px-4 py-2 bg-brand-green text-white text-xs font-bold rounded-lg hover:opacity-90 transition">
                  Download APK
                </a>
              </div>
            </div>

            {/* iOS Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-8 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">🍎</span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-md border border-blue-500/30 font-bold">TestFlight Beta</span>
                </div>
                <h3 className="text-xl font-bold text-brand-dark dark:text-white font-display">iOS Companion App</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Engineered using Apple's Human Interface Guidelines, offering a full native feel, responsive gesture controls, Apple Pay integration, and dark mode support.
                </p>
                <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl flex items-center gap-4 border border-gray-100 dark:border-gray-900">
                  <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200">
                    {/* Simulated App Store QR */}
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center p-1 rounded-lg">
                      <div className="w-full h-full bg-white grid grid-cols-3 gap-0.5 p-1">
                        {[...Array(9)].map((_, i) => (
                          <div key={i} className={`rounded-sm ${i % 2 === 0 || i === 7 ? 'bg-blue-600' : 'bg-transparent'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Join TestFlight Beta</span>
                    <span className="text-xs font-semibold text-gray-500">
                      Internal testing channel active for V20.
                    </span>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-gray-100 dark:border-gray-800 mt-6 flex justify-between items-center">
                <span className="text-xs text-gray-400">Target: iOS 16.0+</span>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  Request Access
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* EU Regulatory Compliance Engine Logs */}
        <section className="py-6 px-8 rounded-3xl bg-gray-50 dark:bg-gray-900/30 border border-gray-150 dark:border-gray-850 mb-16 font-mono text-[10px] text-gray-500 dark:text-gray-400 space-y-2.5">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-850 pb-2 mb-2 font-sans font-bold text-gray-400">
            <span>DIRECT EU COMPLIANCE DELEGATES LOG</span>
            <span className="text-emerald-500 flex items-center gap-1 font-bold">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              LEDGER_SYNC_OK
            </span>
          </div>
          <div className="flex gap-2">
            <span className="text-brand-gold font-bold shrink-0">[KYBC-LOG]</span>
            <p>DSA Article 30 merchant register active: verified 10 regional producers across France, Italy, Spain, and Germany. DAC7 tax reporting is in progress.</p>
          </div>
          <div className="flex gap-2 border-t border-gray-100 dark:border-gray-900/50 pt-2.5">
            <span className="text-brand-gold font-bold shrink-0">[TAX-OSS]</span>
            <p>DAC7 reporting node online. VAT OSS rates bound dynamically matching Germany (7%), France (5.5%), Spain (10%), and Italy (4%).</p>
          </div>
          <div className="flex gap-2 border-t border-gray-100 dark:border-gray-900/50 pt-2.5">
            <span className="text-brand-gold font-bold shrink-0">[ALLERGEN]</span>
            <p>Regulation EU 1169/2011 allergen disclosures enforced. All listings verified for the 14 mandatory disclosures.</p>
          </div>
        </section>

        {/* Zero Step Checkout Side Drawer */}
        <ZeroStepCheckout
          product={selectedProductForCheckout}
          isOpen={isCheckoutOpen}
          onClose={() => {
            setIsCheckoutOpen(false);
            setSelectedProductForCheckout(null);
          }}
        />
      </PageWrapper>
    );
  }

  if (demoVersion === 'v15') {
    return (
      <PageWrapper>
        {/* Next-Gen Hero Banner */}
        <section className="relative overflow-hidden py-16 px-6 rounded-[32px] bg-gradient-to-br from-violet-50/60 via-white to-fuchsia-50/30 dark:from-gray-955 dark:via-gray-900 dark:to-indigo-950/20 border border-gray-150 dark:border-indigo-950/40 shadow-sm mb-16 text-center animate-slide-up">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-block text-[9px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 animate-pulse">
              Introducing EUshop v15.0
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-brand-dark dark:text-white tracking-tight leading-tight uppercase font-display">
              Sensory Food Discovery <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-400">Simplified</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Experience conversational AI food matching, compliance pre-cleared logistics under the Digital Services Act (DSA), and zero-step biometric checkout.
            </p>
          </div>
        </section>

        {/* AI Predictive Search */}
        <section className="mb-12">
          <PredictiveSearch onSearch={handleSearch} onClear={handleClearSearch} />
        </section>

        {/* Dynamic Canvas Area */}
        <section className="mb-16">
          <DiscoveryCanvas
            products={filteredProducts}
            isLoading={isLoadingSearch || loadingFoods}
            onQuickCheckout={(prod) => {
              setSelectedProductForCheckout(prod);
              setIsCheckoutOpen(true);
            }}
          />
        </section>

        {/* Direct Compliance Ledger Live Feed */}
        <section className="py-6 px-8 rounded-3xl bg-gray-50 dark:bg-gray-900/30 border border-gray-150 dark:border-gray-850 mb-16 font-mono text-[10px] text-gray-500 dark:text-gray-400 space-y-2.5">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-850 pb-2 mb-2 font-sans font-bold text-gray-400">
            <span>DIRECT EU COMPLIANCE DELEGATES LOG</span>
            <span className="text-emerald-500 flex items-center gap-1 font-bold">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              LEDGER_SYNC_OK
            </span>
          </div>
          <div className="flex gap-2">
            <span className="text-indigo-500 font-bold shrink-0">[KYBC-LOG]</span>
            <p>DSA Article 30 merchant register active: verified 10 regional producers across France, Italy, Spain, and Germany. DAC7 tax reporting is in progress.</p>
          </div>
          <div className="flex gap-2 border-t border-gray-100 dark:border-gray-900/50 pt-2.5">
            <span className="text-indigo-500 font-bold shrink-0">[TAX-OSS]</span>
            <p>DAC7 reporting node online. VAT OSS rates bound dynamically matching Germany (7%), France (5.5%), Spain (10%), and Italy (4%).</p>
          </div>
        </section>

        {/* Zero Step Checkout Side Drawer */}
        <ZeroStepCheckout
          product={selectedProductForCheckout}
          isOpen={isCheckoutOpen}
          onClose={() => {
            setIsCheckoutOpen(false);
            setSelectedProductForCheckout(null);
          }}
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 text-center rounded-3xl bg-gradient-to-br from-brand-cream/80 via-white to-brand-sand/40 dark:from-gray-900 dark:via-gray-955 dark:to-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm mb-16 animate-slide-up">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-brand-dark dark:text-white mb-6 tracking-tight leading-tight font-display">
            Discover Europe's Finest <span className="text-primary dark:text-blue-400 font-semibold">Artisanal</span> Foods
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Connect directly with verified sellers across the EU Single Market. Discover rare delicacies, organic pantry staples, and regional specialties.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/search">
              <Button size="lg" variant="primary">
                Start Exploring
              </Button>
            </Link>
            <Link href="/become-seller">
              <Button size="lg" variant="secondary">
                Become a Seller
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 mb-16">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-dark dark:text-white font-display">
            Why Choose EUshop?
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            A secure, regulated marketplace designed strictly for European commerce.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 hover:shadow-md transition duration-200">
            <div className="text-4xl mb-4" aria-hidden="true">🇪🇺</div>
            <h3 className="text-lg font-bold mb-2 text-brand-dark dark:text-white font-display">Pan-European Shipping</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              We operate exclusively within the EU Single Market. No custom tariff delays, simple veterinary controls, and fast domestic transport.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 hover:shadow-md transition duration-200">
            <div className="text-4xl mb-4" aria-hidden="true">🤝</div>
            <h3 className="text-lg font-bold mb-2 text-brand-dark dark:text-white font-display">Verified EU Merchants</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Every listing is published by traders fully verified under the Digital Services Act (DSA). DAC7 annual tax reporting is in progress.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 hover:shadow-md transition duration-200">
            <div className="text-4xl mb-4" aria-hidden="true">🛡️</div>
            <h3 className="text-lg font-bold mb-2 text-brand-dark dark:text-white font-display">Regulatory Assurance</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              All listings mandate disclosure of allergens (Regulation EU 1169/2011). Shop securely with full transparency on ingredients.
            </p>
          </div>
        </div>
      </section>

      {/* Trending Foods */}
      <section className="py-12 mb-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-dark dark:text-white font-display">
              🔥 Trending Now
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Top requested regional items across the continent.
            </p>
          </div>
          <Link href="/search" className="text-sm font-semibold text-primary dark:text-blue-400 hover:underline">
            View All Listings &rarr;
          </Link>
        </div>
        
        {loadingFoods ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="h-[360px] bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
            <div className="h-[360px] bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
            <div className="h-[360px] bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trendingFoods.slice(0, 3).map((food) => (
              <ProductCard
                key={food.id}
                id={food.id}
                name={food.name}
                description={food.description || ''}
                price={food.price}
                country={food.country}
                imageUrl={getFoodImage(food.name)}
                allergens={food.allergens || []}
                seller={{
                  name: 'Producer',
                  rating: 5.0,
                  verified: true,
                }}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white rounded-3xl p-8 sm:p-12 text-center shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
        <h2 className="text-2xl sm:text-4xl font-extrabold mb-4 font-display">
          Ready to Trade Across Borders?
        </h2>
        <p className="text-sm sm:text-base mb-8 text-gray-100 max-w-xl mx-auto leading-relaxed">
          Create a customer profile to order specialty delicacies, or register your commercial business to sell within the EU Single Market today.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/search">
            <button className="bg-white text-primary px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition text-sm">
              Browse Listings
            </button>
          </Link>
          <Link href="/become-seller">
            <button className="border border-white/40 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition text-sm">
              Sell with Us
            </button>
          </Link>
        </div>
      </section>
    </PageWrapper>
  );
}

