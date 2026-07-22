import React from 'react';
import Link from 'next/link';
import { type FoodItem } from '../../../lib/services';
import { readCart, writeCart } from '../../../lib/storageSafety';

interface MarketplacePulseProps {
  items: FoodItem[];
  onAddToCart?: (id: string) => void;
}

export const MarketplacePulse: React.FC<MarketplacePulseProps> = ({ items, onAddToCart }) => {
  const handleAdd = (item: FoodItem) => {
    if (onAddToCart) {
      onAddToCart(item.id);
      return;
    }

    const cart = readCart();
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: item.id,
        name: item.name,
        country: item.country,
        price: item.price,
        quantity: 1,
        sellerId: item.sellerId,
        finderFee: item.finderFee,
      });
    }

    if (writeCart(cart).ok) {
      window.dispatchEvent(new Event('cart-updated'));
    }
  };

  return (
    <section className="py-12" aria-labelledby="marketplace-pulse-title">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8 border-b border-[#dcd7cb] pb-4">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-[#1845d4] flex items-center gap-1.5">
            <span>✨</span> Fresh Direct Shipments
          </span>
          <h2 id="marketplace-pulse-title" className="text-2xl sm:text-3xl font-extrabold text-[#141613] tracking-tight font-display mt-1">
            From Europe This Week
          </h2>
        </div>
        <Link
          href="/search"
          className="text-sm font-bold text-[#1845d4] hover:text-[#102f8f] flex items-center gap-1 hover:underline"
        >
          View All Regional Foods →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {items.map((item) => {
          return (
            <div
              key={item.id}
              className="bg-[#fffdf8] rounded-2xl border border-[#dcd7cb] p-5 shadow-sm hover:shadow-lg transition duration-200 flex flex-col justify-between group"
            >
              <div>
                {/* Header info */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-[#efece4] text-[#141613] border border-[#dcd7cb]">
                    <span>{item.country === 'Italy' ? '🇮🇹' : item.country === 'France' ? '🇫🇷' : item.country === 'Spain' ? '🇪🇸' : item.country === 'Germany' ? '🇩🇪' : '🇪🇺'}</span>
                    {item.country}
                  </span>
                  {item.category && (
                    <span className="text-[10px] font-bold uppercase text-[#65675f] font-mono">
                      {item.category}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-[#141613] group-hover:text-[#1845d4] transition duration-150 line-clamp-2 mb-2 font-display">
                  <Link href={`/products/${item.id}`}>{item.name}</Link>
                </h3>

                {/* Seller & Authenticity */}
                <div className="text-xs text-[#65675f] space-y-1 mb-4">
                  <p className="flex items-center gap-1.5 font-medium">
                    <span className="text-[#365e38] font-bold">✓ Seller:</span> {item.sellerId || 'Independent Producer'}
                  </p>
                  {item.allergens && item.allergens.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.allergens.slice(0, 3).map((a) => (
                        <span key={a} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#c84e38]/10 text-[#c84e38] border border-[#c84e38]/20">
                          Contains: {a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer CTA & Price */}
              <div className="pt-4 border-t border-[#dcd7cb] flex items-center justify-between gap-3 mt-4">
                <div>
                  <span className="text-[10px] text-[#65675f] uppercase tracking-wider block font-semibold">EUR Consideration</span>
                  <span className="text-xl font-extrabold text-[#141613] font-mono">€{item.price.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => handleAdd(item)}
                  className="px-4 py-2.5 bg-[#141613] hover:bg-[#1845d4] text-white font-bold text-xs rounded-xl transition duration-150 shadow-md flex items-center gap-1.5"
                >
                  <span>🛒</span> Add to Order
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
