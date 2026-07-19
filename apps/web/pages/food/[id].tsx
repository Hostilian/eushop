import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { foodAPI } from '../../lib/services';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { AllergenBadge, VerifiedSellerBadge } from '../../components/ui/Badge';
// COMPLIANCE-REVIEW: EU_ALLERGENS_14 is the single source of truth for allergen names.
// Import from packages/compliance once workspace resolution is confirmed.
import { EU_ALLERGENS_14 } from '@eushop/compliance';
import { StartConversationButton } from '../../components/chat/StartConversationButton';

interface FoodDetail {
  id: string;
  name: string;
  description: string;
  country: string;
  price: number;
  category: string;
  seller?: { id?: string; name?: string; rating?: number; verified?: boolean };
  dietaryRestrictions?: string[];
  allergens?: string[];
  images?: string[];
  finderFee?: number;
  // FIC Art. 14 mandatory fields
  ingredients?: string;
  netQuantity?: string;
  storageInstructions?: string;
  nutritionPer100g?: {
    energyKcal: number; fatG: number; saturatedFatG: number;
    carbohydrateG: number; sugarsG: number; proteinG: number; saltG: number;
  };
  isPrepacked?: boolean;
  qualityScheme?: 'PDO' | 'PGI' | 'TSG';
  qualitySchemeVerified?: boolean;
}

function sanitizeHTML(str: string): string {
  if (!str) return '';
  return str.replace(/[&<>"']/g, (m) => {
    switch (m) {
      case '&': return '&';
      case '<': return '<';
      case '>': return '>';
      case '"': return '"';
      case "'": return "'";
      default: return m;
    }
  });
}

export default function FoodDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [food, setFood] = useState<FoodDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    if (!id) {
      // If no ID, set loading to false and return
      setTimeout(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      }, 0);
      return () => {
        isCancelled = true;
      };
    }

    const idStr = id as string;
    // Validate ID format
    if (!/^[a-zA-Z0-9-_]{1,64}$/.test(idStr)) {
      setTimeout(() => {
        if (!isCancelled) {
          setError('Invalid product ID.');
          setLoading(false);
        }
      }, 0);
      return () => {
        isCancelled = true;
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    foodAPI.getById(idStr, { signal: controller.signal })
      .then((result: any) => {
        if (isCancelled) return;
        if (!result?.id || !result?.name || typeof result?.price !== 'number') {
          throw new Error('Invalid product data');
        }
        setFood({
          id: sanitizeHTML(result.id),
          name: sanitizeHTML(result.name),
          description: sanitizeHTML(result.description || ''),
          country: sanitizeHTML(result.country || ''),
          price: Math.max(0, Number(result.price)),
          category: sanitizeHTML(result.category || ''),
          seller: result.seller ? {
            id: sanitizeHTML(result.seller.id || ''),
            name: result.seller.name ? sanitizeHTML(result.seller.name) : undefined,
            rating: typeof result.seller.rating === 'number' ? Math.min(5, Math.max(0, result.seller.rating)) : undefined,
            verified: result.seller.verified === true,
          } : undefined,
          dietaryRestrictions: result.dietaryRestrictions?.map(sanitizeHTML).slice(0, 20) || [],
          allergens: result.allergens?.map(sanitizeHTML).slice(0, 20) || [],
          images: result.images?.filter((img: string) => img?.startsWith('/') || img?.startsWith('https://')).slice(0, 10) || [],
          finderFee: result.finderFee ? Math.max(0, Number(result.finderFee)) : undefined,
          ingredients: result.ingredients ? sanitizeHTML(result.ingredients) : undefined,
          netQuantity: result.netQuantity ? sanitizeHTML(result.netQuantity) : undefined,
          storageInstructions: result.storageInstructions ? sanitizeHTML(result.storageInstructions) : undefined,
          nutritionPer100g: result.nutritionPer100g || undefined,
          isPrepacked: result.isPrepacked !== false,
          qualityScheme: result.qualityScheme,
          qualitySchemeVerified: Boolean(result.qualitySchemeVerified),
        });
        setLoading(false);
      })
      .catch((err: any) => {
        if (isCancelled) return;
        if (err.name === 'AbortError') {
          setTimeout(() => {
            setError('Request timed out. Please try again.');
            setLoading(false);
          }, 0);
        } else {
          setTimeout(() => {
            setError('Could not load this product. Try searching for alternatives.');
            setLoading(false);
          }, 0);
        }
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [id]);

  const handleAddToCart = () => {
    if (!food) return;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) return;
    setAddingToCart(true);
    try {
      let cart: any[] = [];
      try { cart = JSON.parse(localStorage.getItem('cart') || '[]'); } catch { cart = []; }
      if (!Array.isArray(cart)) cart = [];
      const idx = cart.findIndex((i: any) => i?.id === food.id);
      if (idx > -1) {
        cart[idx].quantity = Math.min(100, cart[idx].quantity + quantity);
      } else {
        cart.push({ id: food.id, name: food.name, country: food.country, price: food.price, quantity, sellerId: food.seller?.id || '' });
      }
      localStorage.setItem('cart', JSON.stringify(cart.slice(0, 50)));
      window.dispatchEvent(new Event('cart-updated'));
      router.push('/cart');
    } catch {
      alert('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  // JSON-LD structured data for SEO (Phase 4.1)
  // COMPLIANCE-REVIEW: Do not include compliance claims in structured data.
  const jsonLd = food ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: food.name,
    description: food.description,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: food.price.toFixed(2),
      ...(food.seller?.name ? { seller: { '@type': 'Organization', name: food.seller.name } } : {}),
    },
  } : null;

  if (loading) {
    return (
      <PageWrapper>
        <div className="py-24 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green mb-4" aria-hidden="true" />
            <p className="text-gray-600 dark:text-gray-400">Loading product details…</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error || !food) {
    return (
      <PageWrapper>
        <div className="max-w-4xl mx-auto py-6">
          <Link href="/search" className="text-brand-green dark:text-brand-gold hover:underline mb-8 inline-block font-semibold">
            ← Back to search
          </Link>
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl" role="alert">
            <p className="font-semibold">{error || 'Product not found'}</p>
            <p className="text-sm mt-2">
              <Link href="/search" className="text-brand-green dark:text-brand-gold font-semibold hover:underline">Search for other products →</Link>
            </p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {jsonLd && (
        <Head>
          <title>{food.name} — EUshop</title>
          <meta name="description" content={`${food.name} from ${food.country}. ${food.description.slice(0, 120)}`} />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </Head>
      )}

      <div className="max-w-5xl mx-auto py-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <Link href="/" className="hover:text-brand-green dark:hover:text-brand-gold">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/search" className="hover:text-brand-green dark:hover:text-brand-gold">Browse</Link>
          <span aria-hidden="true">/</span>
          <span className="text-gray-800 dark:text-gray-200 font-medium">{food.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 flex items-center justify-center aspect-square">
            {food.images && food.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={food.images[0]} alt={`Photo of ${food.name}`} className="w-full h-full object-cover rounded-xl" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
            ) : (
              <span className="text-8xl" aria-label={`${food.category || 'food'} product`} role="img">
                {food.category?.toLowerCase().includes('chocolate') ? '🍫' :
                 food.category?.toLowerCase().includes('cheese') ? '🧀' :
                 food.category?.toLowerCase().includes('wine') ? '🍷' : '🌿'}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Name + quality scheme */}
            <div>
              <div className="flex items-start gap-3 flex-wrap mb-1">
                <h1 className="text-3xl font-extrabold text-brand-dark dark:text-white font-display leading-tight">
                  {food.name}
                </h1>
                {/* PDO/PGI/TSG badge — only when platform-verified */}
                {food.qualityScheme && food.qualitySchemeVerified && (
                  <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
                    🏅 {food.qualityScheme}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {food.category} · Origin: <strong className="text-gray-700 dark:text-gray-300">{food.country}</strong>
              </p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-brand-green dark:text-brand-gold">
                €{food.price.toFixed(2)}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">incl. VAT (rate confirmed at checkout)</span>
            </div>

            {/* DSA Art. 30(7): Sold by — persistent, non-decorative */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
              <span className="text-xs text-gray-500 dark:text-gray-400">Sold by</span>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{food.seller?.name || 'Seller information pending'}</span>
              {food.seller?.verified && <VerifiedSellerBadge />}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{food.description}</p>

            {/* ─── FIC Art. 14 Pre-Purchase Disclosure Block ─────────────────────
                EU Reg. 1169/2011 Art. 14: For prepacked food sold at distance,
                ALL mandatory food information must be available before purchase.
                COMPLIANCE-REVIEW: Verify completeness with food safety counsel. */}
            <section aria-labelledby="fic-disclosure-heading" className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-4">
              <h2 id="fic-disclosure-heading" className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                Food Information (EU Reg. 1169/2011)
              </h2>

              {/* Allergens — WCAG 1.4.1: text + aria-label, not colour alone */}
              <div>
                <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-2">
                  Allergen Declaration
                </h3>
                {food.allergens && food.allergens.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5" aria-label="This product contains the following allergens:">
                    {food.allergens.map((a) => (
                      <AllergenBadge key={a} allergen={a} />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    No major EU-regulated allergens declared by the seller. If you have allergies, contact the seller before ordering.
                  </p>
                )}
              </div>

              {/* Ingredients */}
              {food.ingredients && (
                <div>
                  <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Ingredients</h3>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{food.ingredients}</p>
                </div>
              )}

              {/* Net quantity */}
              {food.netQuantity && (
                <div>
                  <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Net Quantity</h3>
                  <p className="text-xs text-gray-700 dark:text-gray-300">{food.netQuantity}</p>
                </div>
              )}

              {/* Storage */}
              {food.storageInstructions && (
                <div>
                  <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Storage</h3>
                  <p className="text-xs text-gray-700 dark:text-gray-300">{food.storageInstructions}</p>
                </div>
              )}

              {/* Nutrition */}
              {food.nutritionPer100g && (
                <div>
                  <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-2">Nutrition per 100g</h3>
                  <table className="w-full text-xs text-gray-700 dark:text-gray-300 border-collapse">
                    <tbody>
                      {[
                        ['Energy', `${food.nutritionPer100g.energyKcal} kcal`],
                        ['Fat', `${food.nutritionPer100g.fatG}g`],
                        ['of which saturates', `${food.nutritionPer100g.saturatedFatG}g`],
                        ['Carbohydrate', `${food.nutritionPer100g.carbohydrateG}g`],
                        ['of which sugars', `${food.nutritionPer100g.sugarsG}g`],
                        ['Protein', `${food.nutritionPer100g.proteinG}g`],
                        ['Salt', `${food.nutritionPer100g.saltG}g`],
                      ].map(([label, value]) => (
                        <tr key={label} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-1 pr-4 text-gray-500 dark:text-gray-400">{label}</td>
                          <td className="py-1 font-medium">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Best-before note */}
              <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed">
                Best-before / use-by date will be provided at delivery per EU Reg. 1169/2011 Art. 14(1)(b).
              </p>
            </section>

            {/* Dietary restrictions */}
            {food.dietaryRestrictions && food.dietaryRestrictions.length > 0 && (
              <div className="flex flex-wrap gap-1.5" aria-label="Dietary information:">
                {food.dietaryRestrictions.map((d) => (
                  <span key={d} className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800 font-medium">
                    ✓ {d}
                  </span>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-950">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2.5 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold transition"
                  aria-label="Decrease quantity"
                >−</button>
                <span className="px-4 font-bold text-sm text-brand-dark dark:text-white" aria-live="polite" aria-label={`Quantity: ${quantity}`}>{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(100, quantity + 1))}
                  className="px-3 py-2.5 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold transition"
                  aria-label="Increase quantity"
                >+</button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="flex-1 bg-brand-green text-white py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2"
                aria-label={`Add ${quantity} ${food.name} to cart — €${(food.price * quantity).toFixed(2)}`}
              >
                {addingToCart ? 'Adding…' : `Add to cart — €${(food.price * quantity).toFixed(2)}`}
              </button>
            </div>

            {/* Message Seller Button */}
            {food.seller?.id && <div className="mt-4">
              <StartConversationButton
                sellerId={food.seller?.id || ''}
                sellerName={food.seller?.name || 'Seller'}
                foodId={food.id}
                foodName={food.name}
                className="w-full bg-white text-brand-dark border border-gray-200 hover:bg-gray-50 py-3 rounded-xl font-bold transition text-sm"
              />
            </div>}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}