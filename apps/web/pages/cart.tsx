import Link from 'next/link';
import { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { readCart, writeCart } from '../lib/storageSafety';

interface CartItem {
  id: string;
  name: string;
  country: string;
  price: number;
  quantity: number;
}

const getFoodImage = (foodName: string) => {
  const name = foodName.toLowerCase();
<<<<<<< HEAD
  if (name.includes('chocolate') || name.includes('praline') || name.includes('truffle')) return '/images/belgian_chocolates.png';
  if (name.includes('oil') || name.includes('vinegar') || name.includes('balsamic')) return '/images/italian_olive_oil.png';
  if (name.includes('cheese') || name.includes('manchego')) return '/images/spanish_manchego.png';
  if (name.includes('sausage') || name.includes('speck') || name.includes('marzipan')) return '/images/german_delicatessen.png';
=======
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
>>>>>>> pull-1
  return null;
};

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    return readCart();
  });

  const persist = (items: CartItem[]) => {
    setCartItems(items);
    writeCart(items);
    window.dispatchEvent(new Event('cart-updated'));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty < 1) return;
    persist(cartItems.map(item => item.id === id ? { ...item, quantity: qty } : item));
  };

  const removeItem = (id: string) => persist(cartItems.filter(item => item.id !== id));

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

<<<<<<< HEAD
  return (
    <PageWrapper>
      <div className="py-6">
        <h1 className="text-3xl font-extrabold text-brand-dark dark:text-white mb-8 font-display">
          Your Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-16 text-center shadow-sm">
            <div className="text-6xl mb-6">🛒</div>
            <h2 className="text-xl font-bold text-brand-dark dark:text-white mb-6">Your cart is empty</h2>
            <Link
              href="/search"
              className="inline-block bg-brand-green text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition"
=======
  if (loading) {
    return <div className="flex justify-center items-center h-screen text-gray-500 font-medium font-sans">Loading cart...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <nav className="bg-white border-b border-gray-100 py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-extrabold text-primary flex items-center gap-2">
            <span className="text-secondary">🌿</span> EUshop
          </Link>
          <Link href="/search" className="text-sm font-semibold text-gray-500 hover:text-primary transition">
            Continue Shopping
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-extrabold text-brand-dark mb-8 font-display">Your Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
            <div className="text-6xl mb-6">🛒</div>
            <h2 className="text-xl font-bold text-brand-dark mb-6">Your cart is currently empty</h2>
            <Link
              href="/search"
              className="inline-block bg-primary text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 shadow-md shadow-primary/10 transition"
>>>>>>> pull-1
            >
              Browse Foods
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const img = getFoodImage(item.name);
                return (
<<<<<<< HEAD
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="h-16 w-16 rounded-xl overflow-hidden bg-brand-sand shrink-0 flex items-center justify-center border border-gray-100 dark:border-gray-800">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
=======
                  <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="h-16 w-16 rounded-xl overflow-hidden bg-brand-sand shrink-0 flex items-center justify-center border border-gray-100">
                        {img ? (
>>>>>>> pull-1
                          <img src={img} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl">🧀</span>
                        )}
                      </div>
                      <div>
<<<<<<< HEAD
                        <h3 className="font-bold text-base text-brand-dark dark:text-white">{item.name}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">📍 {item.country}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100 dark:border-gray-800">
                      <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-950">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold transition">−</button>
                        <span className="px-4 font-bold text-sm text-brand-dark dark:text-white">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold transition">+</button>
                      </div>

                      <div className="text-right min-w-[90px]">
                        <p className="font-extrabold text-brand-green dark:text-brand-gold text-base">€{(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-gray-400 text-xs mt-0.5">€{item.price.toFixed(2)} each</p>
                      </div>

                      <button onClick={() => removeItem(item.id)} className="text-danger hover:opacity-75 font-bold text-sm transition">
=======
                        <h3 className="font-bold text-base text-brand-dark">{item.name}</h3>
                        <p className="text-gray-500 text-xs mt-0.5">📍 Origin: {item.country}</p>
                        <p className="text-primary font-bold text-sm sm:hidden mt-2">
                          €{item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                      {/* Quantity controls */}
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1.5 hover:bg-gray-200 text-gray-700 font-bold transition"
                        >
                          -
                        </button>
                        <span className="px-4 font-bold text-sm text-brand-dark">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1.5 hover:bg-gray-200 text-gray-700 font-bold transition"
                        >
                          +
                        </button>
                      </div>

                      <div className="hidden sm:block text-right min-w-[100px]">
                        <p className="font-extrabold text-primary text-base">€{(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-gray-400 text-xs mt-0.5">€{item.price.toFixed(2)} each</p>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-danger hover:opacity-85 font-bold text-sm transition"
                      >
>>>>>>> pull-1
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

<<<<<<< HEAD
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 h-fit shadow-sm">
              <h2 className="text-xl font-bold text-brand-dark dark:text-white mb-6 font-display">
                Order Summary
              </h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                  <span>Subtotal</span>
                  <span className="font-semibold text-brand-dark dark:text-white">€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                  <span>Shipping</span>
                  <span className="text-success font-bold">FREE</span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex justify-between font-extrabold text-lg text-brand-dark dark:text-white">
                  <span>Total</span>
=======
            {/* Cart Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 h-fit shadow-sm">
              <h2 className="text-xl font-bold text-brand-dark mb-6 font-display">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Subtotal</span>
                  <span className="font-semibold text-brand-dark">€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Shipping (Standard EU)</span>
                  <span className="text-success font-bold">FREE</span>
                </div>
                <div className="border-t border-gray-100 pt-4 flex justify-between font-extrabold text-lg text-brand-dark">
                  <span>Estimated Total</span>
>>>>>>> pull-1
                  <span>€{subtotal.toFixed(2)}</span>
                </div>
              </div>
              <Link
                href="/checkout"
<<<<<<< HEAD
                className="block w-full bg-brand-green text-white text-center py-3.5 rounded-xl font-bold hover:opacity-90 transition text-sm"
=======
                className="block w-full bg-primary text-white text-center py-3.5 rounded-xl font-bold hover:opacity-90 shadow-md shadow-primary/10 transition text-sm"
>>>>>>> pull-1
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

