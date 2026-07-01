import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { foodAPI } from '../../lib/services';

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
  dietary_restrictions?: string[];
  images?: string[];
  finder_fee?: number;
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
        setError(err.response?.data?.error || 'Failed to load food details');
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
      const cartItem = {
        foodId: food.id,
        quantity,
        price: food.price,
      };
      console.log('Adding to cart:', cartItem);
      // Show success message
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
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading food details...</p>
        </div>
      </div>
    );
  }

  if (error || !food) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Link href="/search" className="text-indigo-600 hover:underline mb-8 inline-block">
            ← Back to Search
          </Link>
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded">
            <p className="font-semibold">{error || 'Food not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-indigo-600">🍫 EUshop</Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Link href="/search" className="text-indigo-600 hover:underline mb-6 inline-block">
          ← Back to Search
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="bg-white rounded-lg shadow p-8">
            <div className="bg-gradient-to-br from-indigo-100 to-blue-100 h-96 rounded-lg flex items-center justify-center text-8xl">
              🍫
            </div>
            <p className="text-gray-500 text-sm mt-4 text-center">Product image placeholder</p>
          </div>

          {/* Details Section */}
          <div>
            {/* Title & Price */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{food.name}</h1>
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold text-indigo-600">€{food.price.toFixed(2)}</span>
                {food.finder_fee && (
                  <span className="text-gray-600">+€{food.finder_fee.toFixed(2)} finder's fee</span>
                )}
              </div>
            </div>

            {/* Location & Category */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Location</p>
                  <p className="text-lg font-bold">📍 {food.country}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Category</p>
                  <p className="text-lg font-bold">{food.category}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-bold mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed">{food.description}</p>
            </div>

            {/* Dietary Info */}
            {food.dietary_restrictions && food.dietary_restrictions.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-bold mb-3">Dietary Info</h3>
                <div className="flex flex-wrap gap-2">
                  {food.dietary_restrictions.map((diet, idx) => (
                    <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      ✓ {diet}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Seller Info */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Seller</h3>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-lg">{food.seller.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-yellow-500">⭐ {food.seller.rating}</span>
                    {food.seller.verified && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quantity & Action Buttons */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-gray-300 rounded hover:bg-gray-100"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 border border-gray-300 rounded hover:bg-gray-100"
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
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {addingToCart ? 'Adding...' : '🛒 Add to Cart'}
                </button>
                <button
                  onClick={handleContactSeller}
                  className="flex-1 border-2 border-indigo-600 text-indigo-600 py-3 rounded-lg font-semibold hover:bg-indigo-50"
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
