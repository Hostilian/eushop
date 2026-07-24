import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { EuropeanFoodAtlas } from '../../components/v77/discovery/EuropeanFoodAtlas';
import { DEMO_PRODUCTS, type DemoProduct } from '../../data/demo-products';
import { readCart, writeCart } from '../../lib/storageSafety';

export default function AtlasIndexPage() {
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>('ALL');
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);

  const countries = ['ALL', 'Portugal', 'Spain', 'France', 'Italy', 'Germany', 'Austria', 'Belgium', 'United Kingdom', 'Ireland', 'Sweden', 'Hungary', 'Poland', 'Greece', 'Turkey'];

  const filteredDishes = selectedCountryFilter === 'ALL'
    ? DEMO_PRODUCTS
    : DEMO_PRODUCTS.filter((item) => item.country === selectedCountryFilter);

  const handleOrderDish = (dish: DemoProduct) => {
    const cart = readCart();
    const existing = cart.find((item) => item.id === dish.id);
    if (existing) {
      existing.quantity = Math.min(100, existing.quantity + 1);
    } else {
      cart.push({
        id: dish.id,
        name: dish.name,
        country: dish.country,
        price: dish.price,
        quantity: 1,
        sellerId: dish.sellerId,
        finderFee: dish.finderFee,
      });
    }

    if (writeCart(cart).ok) {
      window.dispatchEvent(new Event('cart-updated'));
      setAddedItemNotice(`Added "${dish.name}" to your order cart!`);
      setTimeout(() => setAddedItemNotice(null), 3500);
    }
  };

  return (
    <>
      <Head>
        <title>European Cultural Food Atlas & Iconic Regional Dishes — EUshop</title>
        <meta
          name="description"
          content="Explore the living atlas of European protected regional foods, iconic dishes from 25+ countries, and buy verified unique regional specialties directly from producers."
        />
      </Head>

      <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-20">
        {/* Added Cart Notification Banner */}
        {addedItemNotice && (
          <div className="fixed bottom-6 right-6 z-[300] bg-emerald-600 text-white font-bold px-6 py-4 rounded-2xl shadow-2xl border border-emerald-400 flex items-center gap-3 animate-fade-in-up">
            <span>🛒</span>
            <span>{addedItemNotice}</span>
            <Link href="/cart" className="ml-2 underline font-extrabold text-amber-200">
              View Cart →
            </Link>
          </div>
        )}

        {/* Header Hero */}
        <header className="border-b border-neutral-800 bg-neutral-900/90 backdrop-blur py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-2">
              <span>EU Food Knowledge Graph V77</span>
              <span>•</span>
              <span>Regulation (EU) No 1151/2012</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-white mb-4 font-display">
              European Cultural Food Atlas & Dishes Catalogue
            </h1>
            <p className="text-lg text-neutral-300 max-w-4xl leading-relaxed">
              Mapping Europe's protected geographical indications, authentic regional food traditions,
              iconic street foods, and centuries-old producer recipes across all 27 Member States.
            </p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
          {/* Component 1: Interactive Atlas & Visual Terroir Maps */}
          <EuropeanFoodAtlas />

          {/* Component 2: Comprehensive Catalogue of Unique Dishes & Regional Specialties */}
          <section className="space-y-8 pt-8 border-t border-neutral-800">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                  Verified Local Producers & Iconic Dishes
                </span>
                <h2 className="text-3xl font-extrabold text-white font-display">
                  Order Unique Country Specialties & Regional Dishes
                </h2>
                <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
                  Select a country to browse authentic dishes and specialty products cataloged directly from our verified European artisanal sellers.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 bg-neutral-900 px-4 py-2 rounded-xl border border-neutral-800">
                <span>Total Cataloged Items:</span>
                <strong className="text-emerald-400">{filteredDishes.length} Dishes</strong>
              </div>
            </div>

            {/* Country Selector Tabs */}
            <div className="flex flex-wrap gap-2 pt-2">
              {countries.map((country) => (
                <button
                  key={country}
                  onClick={() => setSelectedCountryFilter(country)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                    selectedCountryFilter === country
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 ring-2 ring-emerald-400'
                      : 'bg-neutral-900 text-neutral-300 border border-neutral-800 hover:bg-neutral-800 hover:text-white'
                  }`}
                >
                  {country === 'ALL' ? 'All Countries' : country}
                </button>
              ))}
            </div>

            {/* Dishes Catalogue Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/50 transition duration-300 group shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-neutral-800 text-emerald-300 border border-neutral-700">
                        {dish.country} ({dish.countryIso2})
                      </span>
                      {dish.qualityScheme && (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-amber-400 text-neutral-950">
                          {dish.qualityScheme} Protected
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors mb-2 font-display">
                      {dish.name}
                    </h3>
                    <p className="text-xs text-neutral-300 mb-4 leading-relaxed line-clamp-3">
                      {dish.description}
                    </p>

                    <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800/80 text-[11px] space-y-1.5 mb-4">
                      <div className="flex justify-between text-neutral-400">
                        <span>Category:</span>
                        <strong className="text-neutral-200">{dish.category}</strong>
                      </div>
                      <div className="flex justify-between text-neutral-400">
                        <span>Allergens:</span>
                        <strong className="text-amber-300">
                          {dish.allergens && dish.allergens.length > 0 ? dish.allergens.join(', ') : 'None Declared'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block">Producer Price</span>
                      <span className="text-2xl font-black text-white font-mono">€{dish.price.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => handleOrderDish(dish)}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition shadow-lg flex items-center gap-1.5"
                    >
                      <span>🛒</span> Order Dish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
