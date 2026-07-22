import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { ProductCard } from '../components/ui/ProductCard';
import { VersionReleaseBanner } from '../components/marketplace/VersionReleaseBanner';
import { EuropeanFoodAtlas } from '../components/v77/discovery/EuropeanFoodAtlas';
import { MarketplacePulse } from '../components/v77/discovery/MarketplacePulse';
import { CuratedCollections } from '../components/v77/discovery/CuratedCollections';
import { TrustArchitectureSection } from '../components/v77/trust/TrustArchitectureSection';
import { V77Button } from '../components/v77/ui/V77Button';
import {
  fallbackTrendingFoods,
  foodAPI,
  type FoodItem,
} from '../lib/services';
import type { StatusOrigin } from '../lib/degradation';
import { readCart, writeCart } from '../lib/storageSafety';

const ORIGIN_LABEL: Record<StatusOrigin, string> = {
  live: 'Live marketplace catalogue',
  cache: 'Recently loaded catalogue',
  demo: 'Demonstration catalogue',
  local: 'Bundled local catalogue',
  offline: 'Offline catalogue',
};

const STEPS = [
  {
    number: '01',
    title: 'Discover by place and preference',
    detail: 'Browse regional foods, compare origins, and filter around the allergens or dietary preferences that matter to you.',
  },
  {
    number: '02',
    title: 'Review the listing before buying',
    detail: 'See the named trader, seller-supplied food information, declared allergens, origin details, and item price together.',
  },
  {
    number: '03',
    title: 'Order through one marketplace',
    detail: 'Add products to your cart, review destination VAT at checkout, and keep the seller identity attached to the order journey.',
  },
] as const;

const TRUST_ITEMS = [
  {
    title: 'Allergen disclosures',
    detail: 'Listings surface seller-supplied allergen information using the 14 regulated EU categories. Buyers should still check the product label and contact the seller when needed.',
  },
  {
    title: 'Trader information',
    detail: 'Each listing keeps the offering trader visible. “Verified” means required trader details passed the marketplace review workflow; it is not a legal certification or product guarantee.',
  },
  {
    title: 'Transparent pricing',
    detail: 'Item prices stay visible while shopping, with destination-country VAT shown separately at checkout. Final tax treatment remains subject to professional review.',
  },
] as const;

const getFoodImage = (foodName: string): string | undefined => {
  const name = foodName.toLowerCase();
  if (name.includes('chocolate') || name.includes('praline')) return '/images/belgian_chocolates.png';
  if (name.includes('oil') || name.includes('vinegar') || name.includes('balsamic')) return '/images/italian_olive_oil.png';
  if (name.includes('cheese') || name.includes('manchego')) return '/images/spanish_manchego.png';
  if (name.includes('sausage') || name.includes('speck') || name.includes('marzipan')) return '/images/german_delicatessen.png';
  return undefined;
};

export default function Home() {
  const router = useRouter();
  const [featuredFoods, setFeaturedFoods] = useState<FoodItem[]>(() =>
    fallbackTrendingFoods.slice(0, 3),
  );
  const [catalogueOrigin, setCatalogueOrigin] = useState<StatusOrigin>('demo');
  const [storedRelease, setStoredRelease] = useState<'v66' | 'v55' | 'v44' | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('eushop-demo-version');
      if (stored === 'v66' || stored === 'v55' || stored === 'v44') return stored;
    }
    return null;
  });

  useEffect(() => {
    const handleVersionChange = () => {
      const v = localStorage.getItem('eushop-demo-version');
      if (v === 'v66' || v === 'v55' || v === 'v44') {
        setStoredRelease(v);
      } else {
        setStoredRelease(null);
      }
    };

    window.addEventListener('demo-version-changed', handleVersionChange);
    return () => window.removeEventListener('demo-version-changed', handleVersionChange);
  }, []);

  const queryV = router.query.v as string | undefined;
  const activeRelease: 'v66' | 'v55' | 'v44' | null =
    queryV === 'v66' || queryV === 'v55' || queryV === 'v44'
      ? queryV
      : storedRelease;

  useEffect(() => {
    let active = true;
    foodAPI.getTrendingWithOrigin()
      .then(result => {
        if (!active) return;
        setFeaturedFoods(result.data.slice(0, 3));
        setCatalogueOrigin(result.origin);
      })
      .catch(() => {
        if (!active) return;
        setFeaturedFoods(fallbackTrendingFoods.slice(0, 3));
        setCatalogueOrigin('demo');
      });
    return () => { active = false; };
  }, []);

  const handleAddToCart = (id: string) => {
    const food = featuredFoods.find(item => item.id === id);
    if (!food) return;

    const cart = readCart();
    const existing = cart.find(item => item.id === id);
    if (existing) {
      existing.quantity = Math.min(100, existing.quantity + 1);
    } else {
      cart.push({
        id: food.id,
        name: food.name,
        country: food.country,
        price: food.price,
        quantity: 1,
        sellerId: food.sellerId,
        finderFee: food.finderFee,
      });
    }

    if (writeCart(cart).ok) window.dispatchEvent(new Event('cart-updated'));
  };

  return (
    <PageWrapper>
      <Head>
        <title>EUshop — Authentic Regional Foods from European Sellers</title>
        <meta
          name="description"
          content="Discover authentic regional foods directly from European sellers, with trader information, allergen disclosures, and clear pricing."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://hostilian.github.io/eushop/" />
      </Head>

      {activeRelease && <VersionReleaseBanner version={activeRelease} />}

      {/* v77 Editorial Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-[#141613] px-6 py-14 sm:px-12 sm:py-20 lg:px-16 text-[#fffdf8] shadow-2xl border border-[#dcd7cb]/20 mb-12">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-[500px] h-[500px] bg-[#1845d4]/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-[#e5a024]/20 text-[#e5a024] border border-[#e5a024]/30 uppercase tracking-widest mb-6">
            <span>🇪🇺</span> Category-Defining European Marketplace
          </div>
          
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.08] tracking-tight text-white mb-6">
            Shop Europe <span className="text-[#e5a024]">like a local.</span>
          </h1>
          
          <p className="max-w-2xl text-base sm:text-xl leading-relaxed text-[#dcd7cb]/90 mb-8 font-sans">
            Discover authentic regional foods directly from independent European sellers, verify exact geographical origins, and buy through one trusted Single Market platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-xl mb-6">
            <Link href="/search" className="w-full sm:w-auto">
              <V77Button variant="cobalt" size="lg" className="w-full sm:w-auto text-base">
                <span>🛒</span> Explore European Marketplace
              </V77Button>
            </Link>
            <Link href="/become-seller" className="w-full sm:w-auto">
              <V77Button variant="outline" size="lg" className="w-full sm:w-auto text-base text-white border-white/40 hover:bg-white/10">
                <span>🏛️</span> Sell on EUshop
              </V77Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-[#dcd7cb]/70 pt-4 border-t border-[#dcd7cb]/15">
            <span className="flex items-center gap-1.5"><span className="text-[#365e38] font-black">✓</span> Named Traders (DSA Art. 30)</span>
            <span className="flex items-center gap-1.5"><span className="text-[#365e38] font-black">✓</span> 14 Regulated Allergens</span>
            <span className="flex items-center gap-1.5"><span className="text-[#365e38] font-black">✓</span> Single Market Tax Transparency</span>
          </div>
        </div>
      </section>

      {/* 1. Interactive European Food Atlas */}
      <section className="mb-14">
        <EuropeanFoodAtlas />
      </section>

      {/* 2. Marketplace Pulse ("From Europe This Week") */}
      <MarketplacePulse items={featuredFoods} onAddToCart={handleAddToCart} />

      {/* 3. Curated European Collections */}
      <CuratedCollections />

      {/* 4. Trust Architecture & Compliance Shield */}
      <TrustArchitectureSection />

      {/* 5. Dual Conversion CTA Section */}
      <section className="my-16 bg-gradient-to-br from-[#141613] via-[#1c1f1b] to-[#1845d4]/40 text-[#fffdf8] rounded-3xl p-8 sm:p-12 border border-[#dcd7cb]/20 text-center relative overflow-hidden shadow-2xl">
        <div className="max-w-2xl mx-auto relative z-10">
          <span className="text-xs font-black uppercase tracking-widest text-[#e5a024]">The European Food Wedge</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display mt-2 mb-4 text-white">
            Ready to Connect Across Europe?
          </h2>
          <p className="text-sm sm:text-base text-[#dcd7cb]/90 mb-8 leading-relaxed">
            Whether you are searching for authentic regional olive oils, artisanal chocolates, or expanding your independent European food business across 27 EU member states.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/search" className="w-full sm:w-auto">
              <V77Button variant="cobalt" size="lg" className="w-full sm:w-auto">
                Explore All Products →
              </V77Button>
            </Link>
            <Link href="/become-seller" className="w-full sm:w-auto">
              <V77Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Apply as a Specialist Seller →
              </V77Button>
            </Link>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
