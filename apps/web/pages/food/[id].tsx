import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { foodAPI } from '../../lib/services'; // Updated import

interface FoodDetail {
  id: string;
  name: string;
  description: string;
  country: string;
  price: number;
  category: string;
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
}

function sanitizeHTML(str: string): string {
  if (!str) return '';
  return str.replace(/[&<>"']/g, (m) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    };
    return map[m] || m;
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
    if (!id) return;

    const idStr = id as string;
    // Security: Enhanced ID validation to prevent injection attacks
    if (!/^[a-fA-F0-9-]{1,36}$/.test(idStr)) {
      setTimeout(() => {
        setError('Invalid food ID format');
        setLoading(false);
      }, 0);
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
    };
  }, [id]);

  const handleAddToCart = async () => {
    if (!food) return;

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
    } finally {
      setAddingToCart(false);
    }
  };

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
          </div>
        </div>
      </div>
    );
  }

  if (error || !food) {
    return (
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
          </div>
        </div>
      </div>
    );
  }

  return (
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
                )}
              </div>
            </div>

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
                </div>
              </div>
            )}

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
              </div>
            </div>

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
          </div>
        </div>
      </div>
    </div>
  );
}
