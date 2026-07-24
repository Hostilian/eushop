/**
 * @eushop/web — Multi-Seller Cart Engine
 *
 * Splitting cart items into seller-specific sub-orders, enforcing EU destination VAT
 * derived from @eushop/compliance, and computing shipping quotes per seller.
 *
 * COMPLIANCE-REVIEW: Implements multi-seller cart splitting per EU Directive 2011/83/EU.
 */
import { calculateFoodVat, getFoodVatRate } from '@eushop/compliance';
import { calculateEUShipping } from './shipping-calculator';

export interface CartItem {
  id: string;
  offerId: string;
  producerProductId: string;
  title: string;
  sellerId: string;
  sellerName: string;
  priceCents: number;
  quantity: number;
  allergens: string[];
  perishabilityClass?: 'AMBIENT' | 'CHILLED' | 'FROZEN' | 'FRAGILE';
  originCountryIso2: string;
}

export interface SellerCartSubtotal {
  sellerId: string;
  sellerName: string;
  items: CartItem[];
  subtotalCents: number;
  shippingFeeCents: number;
  vatCents: number;
  totalCents: number;
  estimatedDeliveryDays: number;
  originCountryIso2: string;
}

export interface MultiSellerCartSummary {
  sellerSubtotals: SellerCartSubtotal[];
  grandSubtotalCents: number;
  grandShippingCents: number;
  grandVatCents: number;
  grandTotalCents: number;
  destinationCountryIso2: string;
  destinationPostalCode: string;
}

export function groupCartBySeller(
  items: CartItem[],
  destinationCountryIso2: string = 'DE',
  destinationPostalCode: string = '10115'
): MultiSellerCartSummary {
  const sellerMap = new Map<string, CartItem[]>();

  for (const item of items) {
    const existing = sellerMap.get(item.sellerId) || [];
    existing.push(item);
    sellerMap.set(item.sellerId, existing);
  }

  const sellerSubtotals: SellerCartSubtotal[] = [];
  let grandSubtotalCents = 0;
  let grandShippingCents = 0;
  let grandVatCents = 0;

  for (const [sellerId, sellerItems] of sellerMap.entries()) {
    const sellerName = sellerItems[0]?.sellerName || 'Verified EU Producer';
    const originCountryIso2 = sellerItems[0]?.originCountryIso2 || 'DE';

    const subtotalCents = sellerItems.reduce(
      (sum, item) => sum + item.priceCents * item.quantity,
      0
    );

    const subtotalEur = subtotalCents / 100;
    const vatCalc = calculateFoodVat(subtotalEur, destinationCountryIso2);
    const vatCents = Math.round(vatCalc.vatAmountEur * 100);

    const vatRatePercent = Math.round(getFoodVatRate(destinationCountryIso2) * 100);
    const shippingQuote = calculateEUShipping(
      originCountryIso2,
      destinationPostalCode,
      destinationCountryIso2,
      vatRatePercent
    );

    const shippingFeeCents = Math.round(shippingQuote.totalCostEur * 100);
    const totalCents = subtotalCents + vatCents + shippingFeeCents;

    sellerSubtotals.push({
      sellerId,
      sellerName,
      items: sellerItems,
      subtotalCents,
      shippingFeeCents,
      vatCents,
      totalCents,
      estimatedDeliveryDays: shippingQuote.estimatedDeliveryDays,
      originCountryIso2,
    });

    grandSubtotalCents += subtotalCents;
    grandShippingCents += shippingFeeCents;
    grandVatCents += vatCents;
  }

  const grandTotalCents = grandSubtotalCents + grandShippingCents + grandVatCents;

  return {
    sellerSubtotals,
    grandSubtotalCents,
    grandShippingCents,
    grandVatCents,
    grandTotalCents,
    destinationCountryIso2,
    destinationPostalCode,
  };
}
