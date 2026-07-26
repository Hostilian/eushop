import Link from 'next/link';
import { useState, useMemo } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { readCart, writeCart } from '../lib/storageSafety';
import { groupCartBySeller, CartItem as MultiSellerCartItem } from '../lib/multi-seller-cart';

interface CartItem {
  id: string;
  name: string;
  country: string;
  price: number;
  quantity: number;
  sellerId?: string;
  sellerName?: string;
}

const getFoodImage = (foodName: string) => {
  const name = foodName.toLowerCase();
  if (name.includes('chocolate') || name.includes('praline') || name.includes('truffle')) return '/images/belgian_chocolates.png';
  if (name.includes('oil') || name.includes('vinegar') || name.includes('balsamic')) return '/images/italian_olive_oil.png';
  if (name.includes('cheese') || name.includes('manchego')) return '/images/spanish_manchego.png';
  if (name.includes('sausage') || name.includes('speck') || name.includes('marzipan')) return '/images/german_delicatessen.png';
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

  // Compute multi-seller grouped summary
  const groupedSummary = useMemo(() => {
    const multiItems: MultiSellerCartItem[] = cartItems.map(item => ({
      id: item.id,
      offerId: `offer_${item.id}`,
      producerProductId: `prod_${item.id}`,
      title: item.name,
      sellerId: item.sellerId || item.country || 'seller_eu',
      sellerName: item.sellerName || `${item.country || 'EU'} Specialty Producer`,
      priceCents: Math.round(item.price * 100),
      quantity: item.quantity,
      allergens: [],
      originCountryIso2: (item.country || 'DE').slice(0, 2).toUpperCase(),
    }));

    return groupCartBySeller(multiItems, 'DE', '10115');
  }, [cartItems]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <PageWrapper>
      <div className="py-6">
        <div className="flex items-center justify-between border-b border-[#dcd7cb] pb-4 mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#1845d4]">Single Market Order</span>
            <h1 className="text-3xl sm:text-4xl font-black text-[#141613] font-display mt-1 tracking-tight">
              Your Marketplace Cart
            </h1>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#1845d4]/10 text-[#1845d4] border border-[#1845d4]/20 font-mono">
            {cartItems.reduce((sum, i) => sum + i.quantity, 0)} Items ({groupedSummary.sellerSubtotals.length} Producers)
          </span>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-[#fffdf8] rounded-3xl border border-[#dcd7cb] p-16 text-center shadow-lg">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-[#141613] font-display mb-2">Your marketplace cart is empty</h2>
            <p className="text-sm text-[#65675f] mb-6 max-w-md mx-auto">
              Discover authentic regional foods directly from independent European sellers across 27 EU member states.
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-[#1845d4] hover:bg-[#102f8f] text-white px-8 py-3.5 rounded-xl font-bold transition shadow-md text-sm"
            >
              Explore European Foods →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Grouped by Seller Sub-Orders (EU Directive 2011/83/EU compliance) */}
              {groupedSummary.sellerSubtotals.map((group) => (
                <div
                  key={group.sellerId}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm"
                >
                  {/* Seller Header */}
                  <div className="bg-gray-50 dark:bg-gray-950 px-6 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#1845d4] uppercase tracking-wider">Direct Producer</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">• {group.sellerName}</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        📍 {group.originCountryIso2}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      Est. Delivery: ~{group.estimatedDeliveryDays} days
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="p-6 divide-y divide-gray-100 dark:divide-gray-800 space-y-4 divide-y-0">
                    {group.items.map((item) => {
                      const img = getFoodImage(item.title);
                      const origItem = cartItems.find(i => i.id === item.id);
                      if (!origItem) return null;
                      return (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 first:pt-0"
                        >
                          <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="h-16 w-16 rounded-xl overflow-hidden bg-brand-sand shrink-0 flex items-center justify-center border border-gray-100 dark:border-gray-800">
                              {img ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={img} alt={item.title} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-2xl">🧀</span>
                              )}
                            </div>
                            <div>
                              <h3 className="font-bold text-base text-brand-dark dark:text-white">{item.title}</h3>
                              <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">📍 Origin: {item.originCountryIso2}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100 dark:border-gray-800">
                            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-950">
                              <button onClick={() => updateQuantity(item.id, origItem.quantity - 1)} className="px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold transition">−</button>
                              <span className="px-4 font-bold text-sm text-brand-dark dark:text-white">{origItem.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, origItem.quantity + 1)} className="px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold transition">+</button>
                            </div>

                            <div className="text-right min-w-[90px]">
                              <p className="font-extrabold text-brand-green dark:text-brand-gold text-base">€{(origItem.price * origItem.quantity).toFixed(2)}</p>
                              <p className="text-gray-400 text-xs mt-0.5">€{origItem.price.toFixed(2)} each</p>
                            </div>

                            <button onClick={() => removeItem(item.id)} className="text-danger hover:opacity-75 font-bold text-sm transition">
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 h-fit shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-brand-dark dark:text-white font-display">
                Order Summary
              </h2>

              <div className="space-y-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                  <span>Goods Subtotal ({groupedSummary.sellerSubtotals.length} sellers)</span>
                  <span className="font-semibold text-brand-dark dark:text-white">€{(groupedSummary.grandSubtotalCents / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                  <span>EU Cross-Border Shipping</span>
                  <span className="font-semibold text-brand-dark dark:text-white">
                    {groupedSummary.grandShippingCents === 0 ? 'FREE' : `€${(groupedSummary.grandShippingCents / 100).toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
                  <span>Estimated EU Food VAT</span>
                  <span className="font-semibold text-brand-dark dark:text-white">€{(groupedSummary.grandVatCents / 100).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between font-extrabold text-lg text-brand-dark dark:text-white pt-2">
                <span>Grand Total</span>
                <span>€{(groupedSummary.grandTotalCents / 100).toFixed(2)}</span>
              </div>

              <Link
                href="/checkout"
                className="block w-full bg-brand-green text-white text-center py-3.5 rounded-xl font-bold hover:opacity-90 transition text-sm shadow-md"
              >
                Proceed to Secure Checkout →
              </Link>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

