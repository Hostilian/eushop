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
  if (name.includes('chocolate') || name.includes('praline') || name.includes('truffle')) return '/images/belgian_chocolates.png';
  if (name.includes('oil') || name.includes('vinegar') || name.includes('balsamic')) return '/images/italian_olive_oil.png';
  if (name.includes('cheese') || name.includes('manchego')) return '/images/spanish_manchego.png';
  if (name.includes('sausage') || name.includes('speck') || name.includes('marzipan')) return '/images/german_delicatessen.png';
  return undefined;
};

export default function Home() {
  const [trendingFoods, setTrendingFoods] = useState<FoodItem[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<FoodItem[]>([]);
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [selectedProductForCheckout, setSelectedProductForCheckout] = useState<FoodItem | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    const fetchTrending = async () => {
      setLoadingFoods(true);
      try {
        const foods: any = await foodAPI.getTrending();
        const list = Array.isArray(foods) ? foods : (foods?.data || foods?.foods || []);
        setTrendingFoods(list);
        setFilteredProducts(list);
      } catch {
        setTrendingFoods(fallbackTrendingFoods);
        setFilteredProducts(fallbackTrendingFoods);
      } finally {
        setLoadingFoods(false);
      }
    };
    fetchTrending();
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
          cart.push({ id: item.id, name: item.name, price: item.price, country: item.country, quantity: 1, sellerId: item.sellerId, finderFee: item.finderFee || 2.50 });
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
    setTimeout(() => {
      let results = [...trendingFoods];
      if (filters.country) results = results.filter(p => p.country.toLowerCase() === filters.country!.toLowerCase());
      if (filters.category) results = results.filter(p => p.category?.toLowerCase() === filters.category!.toLowerCase());
      if (filters.maxPrice) results = results.filter(p => p.price <= filters.maxPrice!);
      if (filters.allergensAvoid?.length) {
        results = results.filter(p => {
          const itemAllergens = p.allergens || [];
          return !filters.allergensAvoid!.some(a => itemAllergens.some(ia => ia.toLowerCase() === a.toLowerCase()));
        });
      }
      setFilteredProducts(results);
      setIsLoadingSearch(false);
    }, 450);
  };

  const handleClearSearch = () => setFilteredProducts(trendingFoods);

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-6 sm:px-12 rounded-[40px] bg-gradient-to-br from-brand-green to-slate-900 text-white border border-brand-green/20 shadow-2xl mb-16 text-center animate-slide-up">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-extrabold px-4 py-1.5 rounded-full bg-brand-gold/25 text-brand-gold border border-brand-gold/30">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-ping" />
            Pan-European Artisanal Marketplace
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight font-display">
            Exquisite Artisanal Foods{' '}
            <span className="text-brand-gold">Delivered Pan-EU</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Connect directly with ID-verified independent producers across the EU Single Market. Full allergen disclosure and transparent pricing on every listing.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <a href="#explore" className="px-6 py-3 border border-brand-gold bg-brand-gold text-brand-green hover:opacity-90 font-bold rounded-xl text-sm transition shadow-lg shadow-brand-gold/10">
              Start Exploring
            </a>
            <Link href="/become-seller" className="px-6 py-3 border border-gray-700 hover:bg-gray-800 text-white font-bold rounded-xl text-sm transition">
              Sell with Us
            </Link>
          </div>
        </div>
      </section>

      {/* AI Search */}
      <section id="explore" className="mb-12 scroll-mt-24">
        <PredictiveSearch onSearch={handleSearch} onClear={handleClearSearch} />
      </section>

      {/* Discovery Canvas */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-brand-dark dark:text-white font-display">Gourmet Discovery</h2>
            <p className="text-xs text-gray-500">Double-click or drag items to explore.</p>
          </div>
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

      {/* Trending */}
      <section className="py-12 mb-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-dark dark:text-white font-display">Trending Now</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Top requested regional items across the continent.</p>
          </div>
          <Link href="/search" className="text-sm font-semibold text-brand-green dark:text-brand-gold hover:underline">
            View All →
          </Link>
        </div>
        {loadingFoods ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="h-[360px] bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />)}
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
                seller={{ name: 'Producer', rating: 5.0, verified: true }}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </section>

      {/* Companion Apps */}
      <section id="apps" className="py-16 border-t border-brand-gold/10 scroll-mt-24 mb-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[10px] uppercase font-bold text-brand-gold tracking-widest px-3 py-1 bg-brand-gold/10 border border-brand-gold/20 rounded-full">
            Mobile Apps
          </span>
          <h2 className="text-3xl font-extrabold text-brand-dark dark:text-white font-display mt-4">
            EUshop on Your Phone
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Browse listings, chat with sellers, photograph your products, and search by location — all from your phone.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
          {/* Android */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl">🤖</span>
                <span className="text-[10px] bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-md border border-green-500/30 font-bold">
                  v2.0.0 · Direct APK
                </span>
              </div>
              <h3 className="text-xl font-bold text-brand-dark dark:text-white font-display">Android App</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Camera-based listing upload, push notifications, location search, and Stripe checkout. Distributed as a direct APK — no Play Store required.
              </p>
              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-100 dark:border-gray-900">
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  Download the APK directly from GitHub Releases and install via Android's "Install unknown apps" setting. Requires Android 8.0+.
                </p>
              </div>
            </div>
            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 mt-6 flex justify-between items-center">
              <span className="text-xs text-gray-400">Android 8.0+</span>
              <a
                href="https://github.com/Hostilian/eushop/releases/latest/download/eushop.apk"
                className="px-4 py-2 bg-brand-green text-white text-xs font-bold rounded-lg hover:opacity-90 transition"
              >
                Download APK
              </a>
            </div>
          </div>

          {/* iOS */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl">🍎</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/30 font-bold">
                  v2.0.0 · TestFlight Beta
                </span>
              </div>
              <h3 className="text-xl font-bold text-brand-dark dark:text-white font-display">iOS App</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Full feature parity with Android: browse, search, chat, cart, checkout, and seller dashboard. Built with React Native (Expo) for native iOS feel.
              </p>
              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-2xl border border-gray-100 dark:border-gray-900">
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  The iOS build is available for beta testing. Follow Apple's TestFlight instructions to install on your iPhone or iPad. Requires iOS 16.0+.
                </p>
              </div>
            </div>
            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 mt-6 flex justify-between items-center">
              <span className="text-xs text-gray-400">iOS 16.0+</span>
              <Link href="/android#ios" className="px-4 py-2 bg-brand-green text-white text-xs font-bold rounded-lg hover:opacity-90 transition">
                Join TestFlight
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="py-12 mb-16 border-t border-gray-100 dark:border-gray-800">
        <h2 className="text-xl font-bold text-center text-brand-dark dark:text-white font-display mb-10">
          EU Regulatory Framework
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl">
            <span className="text-2xl" aria-hidden="true">⚖️</span>
            <h3 className="text-sm font-bold text-brand-dark dark:text-white mt-4 mb-2">DSA — Seller Verification</h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
              Every seller must provide trade register number, VAT ID, and tax ID before listings go live. Verification is currently reviewed manually; automated identity checks are in development.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl">
            <span className="text-2xl" aria-hidden="true">💶</span>
            <h3 className="text-sm font-bold text-brand-dark dark:text-white mt-4 mb-2">DAC7 — Tax Reporting</h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
              Seller VAT numbers, TINs, and transaction records are collected and stored. Automated annual reporting to EU tax authorities is in development.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl">
            <span className="text-2xl" aria-hidden="true">🍎</span>
            <h3 className="text-sm font-bold text-brand-dark dark:text-white mt-4 mb-2">EU 1169/2011 — Allergens</h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
              All listings require disclosure of the 14 EU-regulated allergens before publishing. Allergen data is displayed on every product page.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-green text-white rounded-3xl p-8 sm:p-12 text-center shadow-lg relative overflow-hidden mb-8">
        <div className="absolute inset-0 bg-white/5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
        <h2 className="text-2xl sm:text-4xl font-extrabold mb-4 font-display">Ready to Trade Across Borders?</h2>
        <p className="text-sm sm:text-base mb-8 text-gray-100 max-w-xl mx-auto leading-relaxed">
          Create a buyer account to order specialty foods, or register your business to sell within the EU Single Market.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/search">
            <button className="bg-white text-brand-green px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition text-sm">
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
