import React, { useState } from 'react';

export interface FoodOffer {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  tradeRegisterNumber: string;
  countryIso2: string;
  unitPriceEurPerKg: number;
  totalPriceCents: number;
  agingMonths?: number;
  shippingFeeCents: number;
  estimatedDeliveryDays: number;
  stockAvailable: number;
}

interface OfferComparisonProps {
  foodName: string;
  offers: FoodOffer[];
  onSelectOffer: (offer: FoodOffer) => void;
}

export const OfferComparisonEngine: React.FC<OfferComparisonProps> = ({
  foodName,
  offers,
  onSelectOffer,
}) => {
  const [sortBy, setSortBy] = useState<'PRICE' | 'UNIT_PRICE' | 'RATING' | 'SHIPPING'>('UNIT_PRICE');

  const sortedOffers = [...offers].sort((a, b) => {
    if (sortBy === 'PRICE') return a.totalPriceCents - b.totalPriceCents;
    if (sortBy === 'UNIT_PRICE') return a.unitPriceEurPerKg - b.unitPriceEurPerKg;
    if (sortBy === 'RATING') return b.sellerRating - a.sellerRating;
    if (sortBy === 'SHIPPING') return a.estimatedDeliveryDays - b.estimatedDeliveryDays;
    return 0;
  });

  return (
    <div className="border border-neutral-800 bg-neutral-900 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Compare Offers for {foodName}</h2>
          <p className="text-xs text-neutral-400">Available from {offers.length} verified EU producers & distributors</p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-neutral-800 text-white font-semibold py-1.5 px-3 rounded-lg border border-neutral-700 focus:outline-none focus:border-emerald-500"
          >
            <option value="UNIT_PRICE">Unit Price (€/kg)</option>
            <option value="PRICE">Total Price</option>
            <option value="RATING">Seller Rating</option>
            <option value="SHIPPING">Fastest Delivery</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {sortedOffers.map((offer) => (
          <div
            key={offer.id}
            className="p-4 border border-neutral-800 rounded-xl bg-neutral-950/80 hover:border-emerald-500/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-white text-base">{offer.sellerName}</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {offer.countryIso2} • ★ {offer.sellerRating.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                DSA Trade Reg: <span className="font-mono text-neutral-300">{offer.tradeRegisterNumber}</span>
                {offer.agingMonths && ` • Maturation: ${offer.agingMonths} Months`}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-xs text-emerald-400 font-semibold">
                  €{offer.unitPriceEurPerKg.toFixed(2)} / kg
                </div>
                <div className="text-lg font-extrabold text-white">
                  €{(offer.totalPriceCents / 100).toFixed(2)}
                </div>
                <div className="text-[10px] text-neutral-400">
                  + €{(offer.shippingFeeCents / 100).toFixed(2)} shipping ({offer.estimatedDeliveryDays} days)
                </div>
              </div>

              <button
                onClick={() => onSelectOffer(offer)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors shadow-md shrink-0"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
