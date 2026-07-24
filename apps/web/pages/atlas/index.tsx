import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AtlasHero } from '../../components/atlas/AtlasHero';
import { AtlasViewToggle, type AtlasViewMode } from '../../components/atlas/AtlasViewToggle';
import { AtlasCountryRail } from '../../components/atlas/AtlasCountryRail';
import { AtlasCategoryRail } from '../../components/atlas/AtlasCategoryRail';
import { AtlasMap } from '../../components/atlas/AtlasMap';
import { AtlasProductCard } from '../../components/atlas/AtlasProductCard';
import { AtlasQuickView } from '../../components/atlas/AtlasQuickView';
import { AtlasEditorialStory } from '../../components/atlas/AtlasEditorialStory';
import { AtlasFilterPanel, type AtlasFilterState } from '../../components/atlas/AtlasFilterPanel';

import { DEMO_PRODUCTS, type DemoProduct } from '../../data/demo-products';
import { ALL_EU_COUNTRIES } from '../../data/atlas-countries';
import { readCart, writeCart } from '../../lib/storageSafety';

export default function AtlasMasterPage() {
  const router = useRouter();

  // State Management
  const [viewMode, setViewMode] = useState<AtlasViewMode>('shop');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [quickViewProduct, setQuickViewProduct] = useState<DemoProduct | null>(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);
  const [cartNotification, setCartNotification] = useState<string | null>(null);

  // Advanced Filter State
  const [filters, setFilters] = useState<AtlasFilterState>({
    selectedCountry: 'ALL',
    selectedCategory: 'ALL',
    selectedQualityScheme: 'ALL',
    maxPrice: 100,
    excludedAllergens: [],
  });

  // URL State Sync
  useEffect(() => {
    if (!router.isReady) return;
    const { country, category, view, q } = router.query;

    if (typeof country === 'string') {
      setSelectedCountryCode(country.toUpperCase());
    }
    if (typeof category === 'string') {
      setSelectedCategory(category);
    }
    if (view === 'map' || view === 'shop' || view === 'stories') {
      setViewMode(view);
    }
    if (typeof q === 'string') {
      setSearchQuery(q);
    }
  }, [router.isReady, router.query]);

  // Compute Product Count by Country
  const productCountByCountry = React.useMemo(() => {
    const counts: Record<string, number> = {};
    DEMO_PRODUCTS.forEach((prod) => {
      const code = prod.countryIso2 || 'OTHER';
      counts[code] = (counts[code] || 0) + 1;
    });
    return counts;
  }, []);

  // Filter Catalog Logic
  const filteredProducts = React.useMemo(() => {
    return DEMO_PRODUCTS.filter((product) => {
      // Country Filter
      if (selectedCountryCode !== 'ALL' && product.countryIso2 !== selectedCountryCode) {
        return false;
      }
      // Category Filter
      if (selectedCategory !== 'ALL' && product.category !== selectedCategory) {
        return false;
      }
      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(q);
        const matchCountry = product.country.toLowerCase().includes(q);
        const matchDesc = product.description.toLowerCase().includes(q);
        if (!matchName && !matchCountry && !matchDesc) return false;
      }
      // Quality Scheme Filter
      if (
        filters.selectedQualityScheme !== 'ALL' &&
        product.qualityScheme !== filters.selectedQualityScheme
      ) {
        return false;
      }
      // Max Price Filter
      if (product.price > filters.maxPrice) {
        return false;
      }
      // Allergen Exclusion Filter
      if (filters.excludedAllergens.length > 0 && product.allergens) {
        const hasExcluded = product.allergens.some((a) => filters.excludedAllergens.includes(a));
        if (hasExcluded) return false;
      }

      return true;
    });
  }, [selectedCountryCode, selectedCategory, searchQuery, filters]);

  // Cart Add Handler
  const handleAddToCart = (product: DemoProduct, qty: number = 1) => {
    const cart = readCart();
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      existing.quantity = Math.min(100, existing.quantity + qty);
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        country: product.country,
        price: product.price,
        quantity: qty,
        sellerId: product.sellerId,
        finderFee: product.finderFee,
      });
    }

    if (writeCart(cart).ok) {
      window.dispatchEvent(new Event('cart-updated'));
      setCartNotification(`Added ${qty} × "${product.name}" to your basket!`);
      setTimeout(() => setCartNotification(null), 3500);
    }
  };

  const handleCountrySelect = (code: string) => {
    setSelectedCountryCode(code);
    router.push(
      {
        pathname: '/atlas',
        query: { ...router.query, country: code === 'ALL' ? undefined : code },
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <>
      <Head>
        <title>European Food Atlas — Explore & Shop Regional Foods | EUshop</title>
        <meta
          name="description"
          content="A living map of European food, protected origin specialties (PDO/PGI/TSG), and verified local producers across all 27 EU Member States."
        />
      </Head>

      <div className="min-h-screen bg-[#F6F0E5] text-[#201B17] font-sans pb-24">
        {/* Floating Cart Notification */}
        {cartNotification && (
          <div className="fixed bottom-6 right-6 z-[400] bg-[#385543] text-white font-bold px-6 py-4 rounded-2xl shadow-2xl border border-emerald-400 flex items-center gap-3 animate-fade-in-up">
            <span>🛒</span>
            <span className="text-xs font-mono">{cartNotification}</span>
            <Link href="/cart" className="ml-2 text-xs font-black underline text-[#D29A38]">
              View Basket →
            </Link>
          </div>
        )}

        {/* Global Masthead Navigation Header */}
        <header className="border-b border-[#201B17]/10 bg-[#18212A] text-[#F6F0E5] py-4 px-6 sticky top-0 z-[100] backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-black text-[#D29A38] font-display">EUshop</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#D29A38]/20 text-[#D29A38] border border-[#D29A38]/30">
                V77 Atlas
              </span>
            </Link>

            <div className="flex items-center gap-6 text-xs font-bold font-mono">
              <Link href="/atlas" className="text-[#D29A38] underline">
                Atlas Map
              </Link>
              <Link href="/search" className="hover:text-[#D29A38] transition">
                Search
              </Link>
              <Link href="/become-seller" className="hover:text-[#D29A38] transition hidden sm:inline">
                Sell Food
              </Link>
              <Link href="/cart" className="px-3.5 py-1.5 rounded-xl bg-[#385543] text-white flex items-center gap-1.5 shadow-md">
                <span>🛒</span> Basket
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-6 py-8 space-y-10">
          {/* Hero Component */}
          <AtlasHero
            onSearchSubmit={(q) => setSearchQuery(q)}
            onCountrySelect={handleCountrySelect}
            totalProductsCount={DEMO_PRODUCTS.length}
          />

          {/* View Toggle Bar */}
          <AtlasViewToggle
            activeView={viewMode}
            onViewChange={setViewMode}
            resultCount={filteredProducts.length}
          />

          {/* Map Explorer View (If Active or Default) */}
          {(viewMode === 'map' || selectedCountryCode !== 'ALL') && (
            <AtlasMap
              selectedCountryCode={selectedCountryCode}
              onSelectCountry={handleCountrySelect}
              productCountByCountry={productCountByCountry}
            />
          )}

          {/* Country Selector Rail */}
          <AtlasCountryRail
            selectedCountryCode={selectedCountryCode}
            onSelectCountry={handleCountrySelect}
            productCountByCountry={productCountByCountry}
          />

          {/* Food Category Department Rail */}
          <AtlasCategoryRail
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Active Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono text-gray-500 font-bold">FILTERS:</span>
              {selectedCountryCode !== 'ALL' && (
                <span className="px-3 py-1 rounded-xl bg-[#201B17] text-white font-bold flex items-center gap-1">
                  Country: {selectedCountryCode}
                  <button onClick={() => handleCountrySelect('ALL')} className="ml-1 text-[#D29A38]">✕</button>
                </span>
              )}
              {selectedCategory !== 'ALL' && (
                <span className="px-3 py-1 rounded-xl bg-[#385543] text-white font-bold flex items-center gap-1">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory('ALL')} className="ml-1 text-white">✕</button>
                </span>
              )}
              {searchQuery && (
                <span className="px-3 py-1 rounded-xl bg-[#D29A38] text-[#201B17] font-black flex items-center gap-1">
                  Query: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="ml-1 text-[#201B17]">✕</button>
                </span>
              )}
            </div>

            <button
              onClick={() => setIsFilterPanelOpen(true)}
              className="px-4 py-2 bg-white border border-[#201B17]/20 rounded-xl text-xs font-bold text-[#201B17] hover:border-[#201B17] transition flex items-center gap-1.5 shadow-sm"
            >
              <span>🎛️</span> Advanced Filters & Allergens
            </button>
          </div>

          {/* Main Product Commerce Grid */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#201B17]/10 pb-4">
              <h2 className="text-2xl font-black text-[#201B17] font-display">
                Regional Specialty Catalogue
              </h2>
              <span className="text-xs font-mono text-gray-500">
                {filteredProducts.length} Authenticated Foods
              </span>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <AtlasProductCard
                    key={product.id}
                    product={product}
                    onQuickView={setQuickViewProduct}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-[#201B17]/15 rounded-3xl p-12 text-center space-y-4">
                <span className="text-4xl block">🔍</span>
                <h3 className="text-xl font-bold text-[#201B17]">No foods match your active filters</h3>
                <p className="text-xs text-[#201B17]/70 max-w-md mx-auto">
                  Try resetting your country selection or clearing allergen exclusion filters.
                </p>
                <button
                  onClick={() => {
                    handleCountrySelect('ALL');
                    setSelectedCategory('ALL');
                    setSearchQuery('');
                  }}
                  className="px-6 py-2.5 bg-[#385543] text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </section>

          {/* Editorial Feature Break */}
          <AtlasEditorialStory
            regionTag="ALENTEJO · PORTUGAL"
            title="Liquid Gold from the Atlantic Hills"
            subtitle="Centuries-old protected olive groves producing low-acidity extra virgin oils."
            description="In the sun-drenched hills of Alentejo, olive trees dating back to Roman times yield extra virgin oils rich in natural polyphenols. Certified under DOP protection."
            imageSrc="/images/italian_olive_oil.png"
            ctaText="Shop Portuguese Olive Oils"
            onCtaClick={() => handleCountrySelect('PT')}
          />
        </main>

        {/* Quick View Drawer */}
        <AtlasQuickView
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={handleAddToCart}
        />

        {/* Slide-over Filter Panel */}
        <AtlasFilterPanel
          isOpen={isFilterPanelOpen}
          onClose={() => setIsFilterPanelOpen(false)}
          filters={filters}
          onFilterChange={setFilters}
          onResetFilters={() =>
            setFilters({
              selectedCountry: 'ALL',
              selectedCategory: 'ALL',
              selectedQualityScheme: 'ALL',
              maxPrice: 100,
              excludedAllergens: [],
            })
          }
          totalMatching={filteredProducts.length}
        />
      </div>
    </>
  );
}
