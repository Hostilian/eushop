import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { ProductCard } from '../components/ui/ProductCard';
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
  const [featuredFoods, setFeaturedFoods] = useState<FoodItem[]>(() =>
    fallbackTrendingFoods.slice(0, 3),
  );
  const [catalogueOrigin, setCatalogueOrigin] = useState<StatusOrigin>('demo');

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

      <section className="relative overflow-hidden rounded-[2rem] bg-brand-green px-6 py-16 text-white shadow-xl sm:px-12 sm:py-20 lg:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_48%)]" />
        <div className="relative max-w-4xl">
          <p className="mb-5 text-xs font-extrabold uppercase tracking-[0.24em] text-brand-gold">
            Regional food · Named traders · Cross-border discovery
          </p>
          <h1 className="max-w-3xl font-display text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            EUshop helps people discover and buy authentic regional foods directly from verified European sellers.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-emerald-50 sm:text-lg">
            Explore foods by country and origin, review seller-supplied product information, and see who is offering each item before you buy.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/search"
              className="rounded-xl bg-brand-gold px-6 py-3 text-center text-sm font-extrabold text-brand-green outline-none transition hover:brightness-105 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-green"
            >
              Explore Marketplace
            </Link>
            <Link
              href="/become-seller"
              className="rounded-xl border border-white/60 px-6 py-3 text-center text-sm font-extrabold text-white outline-none transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-green"
            >
              Sell on EUshop
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16" aria-labelledby="how-it-works-title">
        <div className="max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-green dark:text-brand-gold">
            How it works
          </p>
          <h2 id="how-it-works-title" className="mt-3 font-display text-3xl font-black text-brand-dark dark:text-white sm:text-4xl">
            From a regional specialty to a confident decision
          </h2>
        </div>
        <ol className="mt-10 grid gap-5 lg:grid-cols-3">
          {STEPS.map(step => (
            <li key={step.number} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <span className="text-xs font-black tracking-[0.2em] text-brand-green dark:text-brand-gold">
                {step.number}
              </span>
              <h3 className="mt-4 text-lg font-extrabold text-brand-dark dark:text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">{step.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-10 dark:border-emerald-900 dark:bg-emerald-950/30 sm:px-10"
        aria-labelledby="trust-layer-title"
      >
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-green dark:text-brand-gold">
          Trust layer
        </p>
        <h2 id="trust-layer-title" className="mt-3 font-display text-3xl font-black text-brand-dark dark:text-white">
          The information buyers need stays close to the product
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {TRUST_ITEMS.map(item => (
            <article key={item.title}>
              <h3 className="text-base font-extrabold text-brand-dark dark:text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">{item.detail}</p>
            </article>
          ))}
        </div>
        <p className="mt-8 border-t border-emerald-200 pt-5 text-xs leading-5 text-gray-600 dark:border-emerald-900 dark:text-gray-400">
          EUshop provides marketplace structure and disclosure surfaces. Legal, tax, food-safety, and trader-verification conclusions require qualified human review.
        </p>
      </section>

      <section className="py-16" aria-labelledby="featured-foods-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-green dark:text-brand-gold">
              A taste of the marketplace
            </p>
            <h2 id="featured-foods-title" className="mt-3 font-display text-3xl font-black text-brand-dark dark:text-white">
              Featured regional foods
            </h2>
          </div>
          <span className="w-fit rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
            {ORIGIN_LABEL[catalogueOrigin]}
          </span>
        </div>

        <div className="mt-8 grid gap-7 md:grid-cols-3">
          {featuredFoods.map(food => (
            <ProductCard
              key={food.id}
              id={food.id}
              name={food.name}
              description={food.description}
              price={food.price}
              country={food.country}
              imageUrl={food.imageUrl ?? getFoodImage(food.name)}
              allergens={food.allergens ?? []}
              seller={food.seller}
              onAddToCart={handleAddToCart}
              origin={catalogueOrigin}
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/search"
            className="inline-flex rounded-xl bg-brand-green px-6 py-3 text-sm font-extrabold text-white outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2"
          >
            Explore Marketplace
          </Link>
        </div>
      </section>
    </PageWrapper>
  );
}
