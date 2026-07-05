import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageWrapper } from '../components/layout/PageWrapper';
import { ProductCard } from '../components/ui/ProductCard';
import { Button } from '../components/ui/Button';
import { foodAPI, FoodItem } from '../lib/services';

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

export default function Home() {
  const [trendingFoods, setTrendingFoods] = useState<FoodItem[]>(fallbackTrendingFoods);
  const [loadingFoods, setLoadingFoods] = useState(false);

  useEffect(() => {
    // Fetch trending foods
    const fetchTrending = async () => {
      setLoadingFoods(true);
      try {
        const foods = await foodAPI.getTrending();
        setTrendingFoods(Array.isArray(foods) ? foods : (foods?.data || foods?.foods || []));
      } catch (error) {
        console.error('Failed to fetch trending foods:', error);
        setTrendingFoods(fallbackTrendingFoods);
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
          cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            country: item.country,
            quantity: 1,
            sellerId: item.sellerId,
            finderFee: item.finderFee || 5.00
          });
        }
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
    } catch (e) {
      console.error('Failed to add to cart:', e);
    }
  };

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
              Every listing is published by traders fully verified under the Digital Services Act (DSA) and registered for DAC7 annual tax reporting.
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

