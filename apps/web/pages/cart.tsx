import Link from 'next/link';
import { useEffect, useState } from 'react';

interface CartItem {
  id: string;
  name: string;
  country: string;
  price: number;
  quantity: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart items:', error);
      }
    }
    // Mock item if cart is empty for demonstration purposes
    else {
      const mockItems = [
        { id: '1', name: 'Belgian Chocolates', country: 'Belgium', price: 24.99, quantity: 2 },
        { id: '2', name: 'Italian Balsamic', country: 'Italy', price: 34.99, quantity: 1 }
      ];
      localStorage.setItem('cart', JSON.stringify(mockItems));
      setCartItems(mockItems);
    }
    setLoading(false);
  }, []);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const updatedCart = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = (id: string) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading cart...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-indigo-600">🍫 EUshop</Link>
          <Link href="/search" className="text-gray-600 hover:text-indigo-600 font-semibold">
            Continue Shopping
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
            <Link
              href="/search"
              className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700"
            >
              Start Browsing Foods
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-indigo-100 p-3 rounded-lg text-3xl">🍫</div>
                    <div>
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <p className="text-gray-500 text-sm">Origin: {item.country}</p>
                      <p className="text-indigo-600 font-semibold sm:hidden mt-1">
                        €{item.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-gray-300 rounded">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                      >
                        -
                      </button>
                      <span className="px-4 font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                      >
                        +
                      </button>
                    </div>

                    <div className="hidden sm:block text-right min-w-[80px]">
                      <p className="font-bold text-indigo-600">€{(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-gray-400 text-xs">€{item.price.toFixed(2)} each</p>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="bg-white rounded-lg shadow p-6 h-fit">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping (Standard EU)</span>
                  <span className="text-green-600 font-semibold">FREE</span>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between font-bold text-lg text-gray-900">
                  <span>Estimated Total</span>
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="block w-full bg-indigo-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
