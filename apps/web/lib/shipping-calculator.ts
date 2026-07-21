// COMPLIANCE-REVIEW: EU Regional Cross-Border Shipping Cost Calculator
// Ensures transparent statutory shipping fee disclosures under EU Consumer Rights Directive.

export interface ShippingQuote {
  originCountry: string;
  destinationPostalCode: string;
  destinationCountry: string;
  baseCostEur: number;
  vatRatePercent: number;
  vatAmountEur: number;
  totalCostEur: number;
  estimatedDeliveryDays: number;
}

const REGIONAL_RATES: Record<string, { base: number; days: number }> = {
  DE: { base: 4.99, days: 2 },
  FR: { base: 6.99, days: 3 },
  IT: { base: 7.99, days: 4 },
  ES: { base: 7.99, days: 4 },
  CZ: { base: 5.49, days: 2 },
  PL: { base: 5.49, days: 3 },
  NL: { base: 5.99, days: 2 },
  BE: { base: 5.99, days: 2 },
  AT: { base: 5.49, days: 2 },
};

export function calculateEUShipping(
  originCountry: string,
  destinationPostalCode: string,
  destinationCountry: string,
  vatRatePercent: number = 21
): ShippingQuote {
  const destKey = destinationCountry.toUpperCase();
  const rateInfo = REGIONAL_RATES[destKey] || { base: 9.99, days: 5 };
  
  // Cross-border surcharge if origin differs from destination
  const isCrossBorder = originCountry.toUpperCase() !== destKey;
  const baseCostEur = isCrossBorder ? rateInfo.base + 2.50 : rateInfo.base;
  
  const vatAmountEur = Number(((baseCostEur * vatRatePercent) / 100).toFixed(2));
  const totalCostEur = Number((baseCostEur + vatAmountEur).toFixed(2));

  return {
    originCountry,
    destinationPostalCode,
    destinationCountry: destKey,
    baseCostEur,
    vatRatePercent,
    vatAmountEur,
    totalCostEur,
    estimatedDeliveryDays: isCrossBorder ? rateInfo.days + 1 : rateInfo.days,
  };
}
