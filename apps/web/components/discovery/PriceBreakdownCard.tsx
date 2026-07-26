import React from 'react';

export interface ShippingBreakdownItem {
  sellerName: string;
  country: string;
  shippingFee: number;
}

export interface PriceBreakdownProps {
  subtotal: number;
  shippingBreakdown: ShippingBreakdownItem[];
  vatRatePercent?: number;
  vatAmount?: number;
  total: number;
  freeShippingThreshold?: number;
  currencySymbol?: string;
}

export const PriceBreakdownCard: React.FC<PriceBreakdownProps> = ({
  subtotal,
  shippingBreakdown,
  vatRatePercent = 19,
  vatAmount,
  total,
  freeShippingThreshold,
  currencySymbol = '€',
}) => {
  const totalShipping = shippingBreakdown.reduce((acc, s) => acc + s.shippingFee, 0);
  const calculatedVat = vatAmount !== undefined ? vatAmount : (subtotal * vatRatePercent) / 100;
  const distanceToFreeShipping =
    freeShippingThreshold && subtotal < freeShippingThreshold
      ? freeShippingThreshold - subtotal
      : 0;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 space-y-5">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
        Price & Shipping Breakdown
      </h3>

      {/* Free Shipping Incentive (Truthful Commercial Rule) */}
      {freeShippingThreshold && distanceToFreeShipping > 0 && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
          <span>Add <strong>{currencySymbol}{distanceToFreeShipping.toFixed(2)}</strong> more for free standard shipping!</span>
        </div>
      )}

      {/* Itemized Lines */}
      <div className="space-y-2.5 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex justify-between items-center">
          <span>Products Subtotal</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {currencySymbol}{subtotal.toFixed(2)}
          </span>
        </div>

        {/* Multi-Seller Shipping Breakdown */}
        {shippingBreakdown.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-gray-200/50 dark:border-gray-800">
            <div className="flex justify-between items-center text-gray-700 dark:text-gray-300 font-medium">
              <span>Shipping ({shippingBreakdown.length} producer{shippingBreakdown.length > 1 ? 's' : ''})</span>
              <span>{currencySymbol}{totalShipping.toFixed(2)}</span>
            </div>

            {shippingBreakdown.map((s, idx) => (
              <div key={idx} className="flex justify-between items-center pl-3 text-[11px] text-gray-500">
                <span>• From {s.sellerName} ({s.country})</span>
                <span>{s.shippingFee === 0 ? 'Free' : `${currencySymbol}${s.shippingFee.toFixed(2)}`}</span>
              </div>
            ))}
          </div>
        )}

        {/* Transparent VAT */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-200/50 dark:border-gray-800">
          <span>Estimated VAT ({vatRatePercent}% EU rate included)</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {currencySymbol}{calculatedVat.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Grand Total */}
      <div className="pt-4 border-t border-gray-300 dark:border-gray-700 flex justify-between items-baseline">
        <div>
          <span className="text-base font-bold text-gray-900 dark:text-white">Total</span>
          <span className="text-[11px] text-gray-500 block">All taxes & fees included</span>
        </div>
        <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
          {currencySymbol}{total.toFixed(2)}
        </span>
      </div>
    </div>
  );
};
