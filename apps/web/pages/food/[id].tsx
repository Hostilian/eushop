import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
<<<<<<< HEAD
import { foodAPI } from '../../lib/services';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { AllergenBadge, VerifiedSellerBadge } from '../../components/ui/Badge';
// COMPLIANCE-REVIEW: EU_ALLERGENS_14 is the single source of truth for allergen names.
// Import from packages/compliance once workspace resolution is confirmed.
import { EU_ALLERGENS_14 } from '@eushop/compliance';
import { StartConversationButton } from '../../components/chat/StartConversationButton';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { readCart, writeCart } from '../../lib/storageSafety';
=======
import { foodAPI } from '../../lib/services'; // Updated import
>>>>>>> pull-1

interface FoodDetail {
  id: string;
  name: string;
  description: string;
  country: string;
  price: number;
  category: string;
<<<<<<< HEAD
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
    energyKj?: number; energyKcal: number; fatG: number; saturatedFatG: number;
    carbohydrateG: number; sugarsG: number; proteinG: number; saltG: number;
  };
  instructionsForUse?: string;
  originStatement?: string;
  durabilityInformation?: string;
  foodBusinessOperator?: { name: string; address: string };
  isPrepacked?: boolean;
  isDemo?: boolean;
  informationStatus?: 'illustrative-unverified';
  qualityScheme?: 'PDO' | 'PGI' | 'TSG';
  qualitySchemeVerified?: boolean;
=======
  seller: {
    id: string;
    name: string;
    rating: number;
    verified: boolean;
  };
  dietaryRestrictions?: string[]; // Changed from dietary_restrictions
  allergens?: string[];
  images?: string[];
  finderFee?: number; // Changed from finder_fee
>>>>>>> pull-1
}

function sanitizeHTML(str: string): string {
  if (!str) return '';
  return str.replace(/[&<>"']/g, (m) => {
<<<<<<< HEAD
    switch (m) {
      case '&': return '&';
      case '<': return '<';
      case '>': return '>';
      case '"': return '"';
      case "'": return "'";
      default: return m;
    }
=======
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    };
    return map[m] || m;
>>>>>>> pull-1
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

<<<<<<< HEAD
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
          instructionsForUse: result.instructionsForUse ? sanitizeHTML(result.instructionsForUse) : undefined,
          originStatement: result.originStatement ? sanitizeHTML(result.originStatement) : undefined,
          durabilityInformation: result.durabilityInformation ? sanitizeHTML(result.durabilityInformation) : undefined,
          foodBusinessOperator: result.foodBusinessOperator ? {
            name: sanitizeHTML(result.foodBusinessOperator.name || ''),
            address: sanitizeHTML(result.foodBusinessOperator.address || ''),
          } : undefined,
          nutritionPer100g: result.nutritionPer100g || undefined,
          isPrepacked: result.isPrepacked !== false,
          isDemo: result.isDemo === true,
          informationStatus: result.informationStatus,
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
=======
    const idStr = id as string;
    // Security: Enhanced ID validation to prevent injection attacks
    if (!/^[a-fA-F0-9-]{1,36}$/.test(idStr)) {
      setError('Invalid food ID format');
      setLoading(false);
      return;
    }

    // Security: Add timeout and abort controller for API call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const fetchFood = async () => {
      try {
        const result = await foodAPI.getById(idStr, { 
          signal: controller.signal,
          headers: {
            'X-Request-ID': Math.random().toString(36).substring(2, 15)
          }
        });
        
        if (result) {
          // Security: Validate API response structure
          if (!result.id || !result.name || typeof result.price !== 'number') {
            throw new Error('Invalid food data structure received');
          }
          
          // Security: Additional price validation
          if (result.price < 0 || result.price > 1000000) {
            throw new Error('Invalid price range');
          }
          
          // Security: Sanitize all string fields from API to prevent XSS
          const sanitized: FoodDetail = {
            id: sanitizeHTML(result.id),
            name: sanitizeHTML(result.name),
            description: sanitizeHTML(result.description || ''),
            country: sanitizeHTML(result.country || ''),
            price: Number(result.price) || 0,
            category: sanitizeHTML(result.category || ''),
            seller: {
              id: sanitizeHTML(result.seller?.id || ''),
              name: sanitizeHTML(result.seller?.name || ''),
              rating: Math.min(5, Math.max(0, Number(result.seller?.rating) || 0)),
              verified: Boolean(result.seller?.verified)
            },
            dietaryRestrictions: result.dietaryRestrictions?.map((r: string) => sanitizeHTML(r)).slice(0, 20) || [],
            allergens: result.allergens?.map((a: string) => sanitizeHTML(a)).slice(0, 20) || [],
            images: result.images?.map((img: string) => {
              // Security: Validate image URLs
              const sanitized = sanitizeHTML(img);
              if (sanitized.startsWith('http://') || sanitized.startsWith('https://')) {
                return sanitized;
              }
              return '';
            }).filter(img => img !== '').slice(0, 10) || [],
            finderFee: result.finderFee ? Math.max(0, Math.min(1000, Number(result.finderFee))) : undefined
          };
          setFood(sanitized);
        } else {
          setError('Food details not found');
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          setError('Request timed out. Please try again.');
        } else {
          // Graceful degradation: Try to load from cache
          try {
            const cachedFoods = localStorage.getItem('cached_foods');
            if (cachedFoods) {
              const parsed = JSON.parse(cachedFoods);
              const cached = parsed.find((f: any) => f.id === idStr);
              if (cached) {
                setFood(cached);
                setLoading(false);
                clearTimeout(timeoutId);
                return;
              }
            }
          } catch (cacheError) {
            console.warn('Cache read failed:', cacheError);
          }
          // If offline, provide a more specific message
          if (!navigator.onLine) {
            setError('You are offline and this item is not cached. Please reconnect to load the details.');
          } else {
            setError('Failed to load food details. You can try searching for other products.');
          }
        }
        console.error('Error fetching food:', err);
      } finally {
        setLoading(false);
        clearTimeout(timeoutId);
      }
    };

    fetchFood();
    
    // Cleanup function
    return () => {
      controller.abort();
      clearTimeout(timeoutId);
>>>>>>> pull-1
    };
  }, [id]);

  const handleAddToCart = () => {
    if (!food) return;
<<<<<<< HEAD
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) return;
    setAddingToCart(true);
    try {
      const cart = readCart();
      const idx = cart.findIndex((i: any) => i?.id === food.id);
      if (idx > -1) {
        cart[idx].quantity = Math.min(100, cart[idx].quantity + quantity);
      } else {
        cart.push({ id: food.id, name: food.name, country: food.country, price: food.price, quantity, sellerId: food.seller?.id || '' });
      }
      const result = writeCart(cart);
      if (!result.ok) throw new Error('Cart storage is unavailable.');
      window.dispatchEvent(new Event('cart-updated'));
      router.push('/cart');
    } catch {
      alert('Failed to add to cart. Please try again.');
=======

    // Security: Validate quantity constraints
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      alert('Quantity must be an integer between 1 and 100');
      return;
    }
    
    setAddingToCart(true);
    try {
      const cartItem = {
        id: food.id,
        name: food.name,
        country: food.country,
        price: food.price,
        quantity,
      };
      
      // Example: Add to localStorage cart with limits and parsing validation
      let existingCart: any[] = [];
      try {
        existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (!Array.isArray(existingCart)) {
          existingCart = [];
        }
      } catch {
        existingCart = [];
      }

      const itemIndex = existingCart.findIndex((item: any) => item && item.id === food.id);

      let updatedCart;
      if (itemIndex > -1) {
        updatedCart = existingCart.map((item: any, idx: number) => 
          idx === itemIndex ? { ...item, quantity: Math.min(100, (item.quantity || 0) + quantity) } : item
        );
      } else {
        updatedCart = [...existingCart, cartItem];
      }

      // Security: Cap maximum unique cart items to prevent client-side denial of service/storage exhaustion
      if (updatedCart.length > 50) {
        updatedCart = updatedCart.slice(0, 50);
        alert('Cart size limit reached (max 50 unique items)');
      }

      localStorage.setItem('cart', JSON.stringify(updatedCart));
      alert(`Added ${quantity} of "${food.name}" to cart`);
    } catch (err) {
      // Graceful degradation: Provide user-friendly error messages
      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        alert('Your cart is full. Please remove some items before adding more.');
      } else if (!navigator.onLine) {
        alert('You are offline. Please check your internet connection and try again.');
      } else {
        alert('Failed to add to cart. Please try again or contact support if the problem persists.');
      }
      console.error('Add to cart error:', err);
>>>>>>> pull-1
    } finally {
      setAddingToCart(false);
    }
  };

<<<<<<< HEAD
  // JSON-LD structured data for SEO & Rich Snippets
  // COMPLIANCE-REVIEW: Do not include unverified compliance claims in structured data.
  const jsonLd = food ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: food.name,
    description: food.description,
    category: food.category || 'Specialty Food',
    countryOfOrigin: food.country ? { '@type': 'Country', name: food.country } : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: food.price.toFixed(2),
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      url: `https://hostilian.github.io/eushop/food/${food.id}`,
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
=======
  const handleContactSeller = () => {
    if (food && food.seller && food.seller.id) {
      // Security: Validate seller ID format
      if (!/^[a-zA-Z0-9-]+$/.test(food.seller.id)) {
        alert('Invalid seller format');
        return;
      }
      router.push(`/messages?seller=${encodeURIComponent(food.seller.id)}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">Loading food details...</p>
          <p className="text-gray-400 text-sm mt-2">This may take a moment</p>
          {/* Graceful degradation: Show a fallback message if loading takes too long */}
          <div className="mt-4">
            <button 
              onClick={() => router.back()}
              className="text-primary hover:underline text-sm"
            >
              ← Go back
            </button>
>>>>>>> pull-1
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error || !food) {
    return (
<<<<<<< HEAD
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
=======
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Link href="/search" className="text-primary hover:underline mb-8 inline-block">
            ← Back to Search
          </Link>
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
            <p className="font-semibold">{error || 'Food not found'}</p>
            <p className="text-sm mt-2">
              Our service is experiencing temporary issues. You can still browse other products or 
              <Link href="/search" className="text-primary font-semibold ml-1">search for alternatives</Link>.
            </p>
            {/* Graceful degradation: Provide offline-specific guidance */}
            {!navigator.onLine && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>Offline mode:</strong> You appear to be offline. Some features may be limited until you reconnect.
                </p>
              </div>
            )}
>>>>>>> pull-1
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
<<<<<<< HEAD
    <PageWrapper>
      {food && (
        <Head>
          <title>{food.name} — EUshop</title>
          <meta name="description" content={`${food.name} from ${food.country}. ${food.description.slice(0, 120)}`} />
          {/* OpenGraph / Facebook */}
          <meta property="og:type" content="product" />
          <meta property="og:title" content={`${food.name} — EUshop`} />
          <meta property="og:description" content={`${food.name} from ${food.country}. ${food.description.slice(0, 120)}`} />
          <meta property="og:url" content={`https://hostilian.github.io/eushop/food/${food.id}`} />
          <meta property="og:site_name" content="EUshop" />
          {food.images && food.images[0] && <meta property="og:image" content={food.images[0]} />}
          <meta property="product:price:amount" content={food.price.toFixed(2)} />
          <meta property="product:price:currency" content="EUR" />
          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`${food.name} — EUshop`} />
          <meta name="twitter:description" content={`${food.name} from ${food.country}. ${food.description.slice(0, 120)}`} />
          {food.images && food.images[0] && <meta name="twitter:image" content={food.images[0]} />}
          {/* Multilingual i18n hreflang link tags for EU Single Market (Task 69) */}
          <link rel="alternate" hrefLang="en" href={`https://hostilian.github.io/eushop/food/${food.id}?lang=en`} />
          <link rel="alternate" hrefLang="de" href={`https://hostilian.github.io/eushop/food/${food.id}?lang=de`} />
          <link rel="alternate" hrefLang="fr" href={`https://hostilian.github.io/eushop/food/${food.id}?lang=fr`} />
          <link rel="alternate" hrefLang="it" href={`https://hostilian.github.io/eushop/food/${food.id}?lang=it`} />
          <link rel="alternate" hrefLang="es" href={`https://hostilian.github.io/eushop/food/${food.id}?lang=es`} />
          <link rel="alternate" hrefLang="cs" href={`https://hostilian.github.io/eushop/food/${food.id}?lang=cs`} />
          <link rel="alternate" hrefLang="x-default" href={`https://hostilian.github.io/eushop/food/${food.id}`} />
          {jsonLd && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
          )}
        </Head>
      )}

      <div className="max-w-5xl mx-auto py-6">
        {/* Breadcrumb */}
        <Breadcrumb items={[
          { label: 'Home', href: '/' },
          { label: 'Browse', href: '/search' },
          ...(food.category ? [{ label: food.category, href: `/category/${encodeURIComponent(food.category.toLowerCase())}` }] : []),
          { label: food.name }
        ]} />

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
=======
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="text-3xl font-extrabold text-primary tracking-tight flex items-center gap-2">
            <span className="text-secondary">🌿</span> EUshop
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <Link href="/search" className="text-primary hover:underline mb-6 inline-block font-semibold">
          ← Back to Search
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="bg-gradient-to-br from-brand-sand to-white h-96 rounded-2xl flex items-center justify-center text-8xl">
              🌿
            </div>
            <p className="text-gray-500 text-sm mt-4 text-center">Product image placeholder</p>
          </div>

          <div>
            <div className="mb-8">
              <h1 className="text-4xl font-extrabold text-brand-dark mb-2 font-display">{food.name}</h1>
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-extrabold text-primary">€{food.price.toFixed(2)}</span>
                {food.finderFee && (
                  <span className="text-gray-600">+€{food.finderFee.toFixed(2)} finder's fee</span>
>>>>>>> pull-1
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {food.category} · Origin: <strong className="text-gray-700 dark:text-gray-300">{food.country}</strong>
              </p>
            </div>

<<<<<<< HEAD
            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-brand-green dark:text-brand-gold">
                €{food.price.toFixed(2)}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">incl. VAT (rate confirmed at checkout)</span>
            </div>

            {/* COMPLIANCE-REVIEW: DSA Art. 30 requires persistent seller identity display. */}
            <div
              className="sticky top-20 z-20 flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
              aria-label={`Sold by ${food.seller?.name?.trim() || 'Seller identity unavailable'}`}
              data-testid="seller-identity"
            >
              <span className="text-xs text-gray-500 dark:text-gray-400">Sold by</span>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{food.seller?.name?.trim() || 'Seller identity unavailable'}</span>
              {food.seller?.verified && <VerifiedSellerBadge />}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{food.description}</p>

            {food.isDemo && (
              <aside
                className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs leading-5 text-sky-900 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200"
                role="status"
              >
                <strong>Demonstration catalogue.</strong> Product, price, trader, origin, recipe, and nutrition values are illustrative and unverified. This is not a live offer.
              </aside>
            )}

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
                    No Annex II allergens are declared in this record. This is not an allergen-free claim; check the package and contact the seller before ordering.
                  </p>
                )}
              </div>

              {/* Ingredients */}
              {food.ingredients && (
                <div>
                  <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Ingredients</h3>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{food.ingredients}</p>
=======
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Location</p>
                  <p className="text-lg font-bold text-brand-dark">📍 {food.country}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Category</p>
                  <p className="text-lg font-bold text-brand-dark">{food.category}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <h3 className="text-lg font-bold mb-3 text-brand-dark">Description</h3>
              <p className="text-gray-700 leading-relaxed">{food.description}</p>
            </div>

            {food.dietaryRestrictions && food.dietaryRestrictions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 className="text-lg font-bold mb-3 text-brand-dark">Dietary Info</h3>
                <div className="flex flex-wrap gap-2">
                  {food.dietaryRestrictions.map((diet, idx) => (
                    <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      ✓ {diet}
                    </span>
                  ))}
>>>>>>> pull-1
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

              {/* Cold-Chain Shipping & Thermal Packaging */}
              <div>
                <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Cold-Chain Logistics & Packaging</h3>
                <p className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-semibold text-[11px]">
                    ❄️ Temperature Controlled
                  </span>
                  <span>Insulated thermal packaging with eco-friendly gel refrigerants (2–8°C EU food transport standard).</span>
                </p>
              </div>

              {food.instructionsForUse && (
                <div>
                  <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Instructions for use</h3>
                  <p className="text-xs text-gray-700 dark:text-gray-300">{food.instructionsForUse}</p>
                </div>
              )}

              {food.originStatement && (
                <div>
                  <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Origin / provenance statement</h3>
                  <p className="text-xs text-gray-700 dark:text-gray-300">{food.originStatement}</p>
                </div>
              )}

              {food.foodBusinessOperator && (
                <div>
                  <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Food business operator</h3>
                  <p className="text-xs text-gray-700 dark:text-gray-300">{food.foodBusinessOperator.name}</p>
                  <p className="text-xs text-gray-700 dark:text-gray-300">{food.foodBusinessOperator.address}</p>
                </div>
              )}

              {/* Nutrition */}
              {food.nutritionPer100g && (
                <div>
                  <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-2">Nutrition per 100g</h3>
                  <table className="w-full text-xs text-gray-700 dark:text-gray-300 border-collapse">
                    <tbody>
                      {[
                        ['Energy', `${food.nutritionPer100g.energyKj ? `${food.nutritionPer100g.energyKj} kJ / ` : ''}${food.nutritionPer100g.energyKcal} kcal`],
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
              <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed">
                {food.durabilityInformation || 'Best-before / use-by information must be available on the item at delivery.'}
              </p>
              {food.informationStatus === 'illustrative-unverified' && (
                <p className="text-[10px] font-semibold text-sky-800 dark:text-sky-300">
                  COMPLIANCE-REVIEW required: this disclosure demonstrates field placement and does not certify a food label or listing.
                </p>
              )}

              {/* GPSR (Regulation (EU) 2023/988 Art. 19) Non-Food Disclosures */}
              {/* COMPLIANCE-REVIEW: Mandatory for non-food distance sales offered to EU consumers */}
              {((food as unknown as Record<string, unknown>).productType === 'non-food' || (food as unknown as Record<string, unknown>).gpsrManufacturer) && (
                <div className="border-t border-gray-200 dark:border-gray-800 pt-3 space-y-2" data-testid="gpsr-disclosures">
                  <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    GPSR Product Safety & Manufacturer Info
                  </h3>
                  {(food as unknown as Record<string, { name: string; address: string; email: string }>).gpsrManufacturer && (
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      <strong>Manufacturer:</strong> {(food as unknown as Record<string, { name: string; address: string; email: string }>).gpsrManufacturer.name}, {(food as unknown as Record<string, { name: string; address: string; email: string }>).gpsrManufacturer.address} ({(food as unknown as Record<string, { name: string; address: string; email: string }>).gpsrManufacturer.email})
                    </p>
                  )}
                  {(food as unknown as Record<string, { name: string; address: string; email: string }>).gpsrResponsiblePerson && (
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      <strong>EU Responsible Person:</strong> {(food as unknown as Record<string, { name: string; address: string; email: string }>).gpsrResponsiblePerson.name}, {(food as unknown as Record<string, { name: string; address: string; email: string }>).gpsrResponsiblePerson.address} ({(food as unknown as Record<string, { name: string; address: string; email: string }>).gpsrResponsiblePerson.email})
                    </p>
                  )}
                  {Array.isArray((food as unknown as Record<string, string[]>).gpsrSafetyWarnings) && (food as unknown as Record<string, string[]>).gpsrSafetyWarnings.length > 0 && (
                    <div className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-800">
                      <strong>Safety Warnings:</strong>
                      <ul className="list-disc pl-4 mt-1 space-y-0.5">
                        {((food as unknown as Record<string, string[]>).gpsrSafetyWarnings).map((w: string, idx: number) => (
                          <li key={idx}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
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

<<<<<<< HEAD
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
=======
            <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6 mb-6">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-brand-dark">
                <span className="text-red-500">⚠️</span> Allergen Information
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                In accordance with EU Regulation 1169/2011, food information must disclose the presence of major allergens:
              </p>
              {food.allergens && food.allergens.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {food.allergens.map((allergen, idx) => (
                    <span key={idx} className="bg-red-50 border border-red-200 text-red-800 px-4 py-1.5 rounded-full text-sm font-semibold">
                      {allergen}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  <span className="font-medium">No major allergens declared by the seller.
                  </span>
                </p>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <h3 className="text-lg font-bold mb-4 text-brand-dark">Seller</h3>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-lg text-brand-dark">{food.seller.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-yellow-500">⭐ {food.seller.rating}</span>
                    {food.seller.verified && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>
>>>>>>> pull-1
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

<<<<<<< HEAD
            {/* Message Seller Button */}
            {food.seller?.id && <div className="mt-4">
              <StartConversationButton
                sellerId={food.seller?.id || ''}
                sellerName={food.seller?.name?.trim() || 'Seller identity unavailable'}
                foodId={food.id}
                foodName={food.name}
                className="w-full bg-white text-brand-dark border border-gray-200 hover:bg-gray-50 py-3 rounded-xl font-bold transition text-sm"
              />
            </div>}
=======
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center border border-gray-300 rounded-lg px-2 py-2"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                  >
                    +
                  </button>
                  <p className="text-gray-600 ml-auto">
                    Total: €{(food.price * quantity).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition"
                >
                  {addingToCart ? 'Adding...' : '🛒 Add to Cart'}
                </button>
                <button
                  onClick={handleContactSeller}
                  className="flex-1 border-2 border-primary text-primary py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
                >
                  💬 Message Seller
                </button>
              </div>
            </div>
>>>>>>> pull-1
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
