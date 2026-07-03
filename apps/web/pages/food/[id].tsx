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

    const fetchFood = async () => {
      try {
        const result = await foodAPI.getById(id as string);
        setFood(result);
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || 'Failed to load food details'); // Added err.message
        console.error('Error fetching food:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFood();
  }, [id]);

  const handleAddToCart = async () => {
    if (!food) return;
    
    setAddingToCart(true);
    try {
      // TODO: Implement cart functionality
      // This part is client-side only for now, no API call here
      const cartItem = {
        id: food.id, // Use food.id for cart item
        name: food.name,
        country: food.country,
        price: food.price,
        quantity,
      };
      
      // Example: Add to localStorage cart
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const itemIndex = existingCart.findIndex((item: any) => item.id === food.id);

      let updatedCart;
      if (itemIndex > -1) {
        updatedCart = existingCart.map((item: any, idx: number) => 
          idx === itemIndex ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        updatedCart = [...existingCart, cartItem];
      }
      localStorage.setItem('cart', JSON.stringify(updatedCart));

      alert(`Added ${quantity} of "${food.name}" to cart`);
    } catch (err) {
      alert('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleContactSeller = () => {
    if (food) {
      router.push(`/messages?seller=${food.seller.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">Loading food details...</p>
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
