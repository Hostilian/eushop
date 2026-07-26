import foodVatRates from './eu-food-vat-rates.json';

/**
 * VAT Engine — EU One-Stop-Shop (OSS) and destination-country VAT logic.
 *
 * COMPLIANCE-REVIEW: All rates and thresholds must be verified by a qualified
 * tax advisor before going live. Rates change; this file must be kept current.
 *
 * Sources:
 *  - EU OSS: https://vat-one-stop-shop.ec.europa.eu
 *  - EU VAT Directive 2006/112/EC
 *  - ViDA (formally adopted March 2025) — watch item, not yet built for.
 */

/**
 * EU OSS combined threshold (goods + digital/TBE services).
 * A seller below this threshold may charge home-country VAT.
 * Above it, destination-country VAT applies and OSS reporting is required.
 *
 * COMPLIANCE-REVIEW: The EU SME cross-border VAT exemption scheme (effective
 * Jan 1 2025, combined €100,000 EU-wide cap) may interact differently for
 * marketplace-facilitated sales. Confirm with a tax advisor before relying on
 * this threshold alone.
 */
export const OSS_THRESHOLD_EUR = 10_000;

/**
 * DAC7 reporting thresholds (Council Directive (EU) 2021/514).
 * A seller is excluded from reporting if BOTH conditions are met.
 *
 * COMPLIANCE-REVIEW: The European Commission has proposed raising the
 * consideration threshold to €3,000 and dropping the transaction count test
 * as part of a 2028 DAC7 reform package (not yet adopted as of mid-2026).
 * Keep these configurable so a future update is a one-line change.
 */
export const DAC7_THRESHOLDS = {
  /** Maximum transactions before reporting is required */
  maxTransactions: 30,
  /** Maximum total consideration (EUR) before reporting is required */
  maxConsiderationEur: 2_000,
} as const;

/**
 * Reduced VAT rates for food products by EU member state (ISO 3166-1 alpha-2).
 * These are the standard reduced rates applicable to most food items.
 *
 * COMPLIANCE-REVIEW: Rates are indicative only. Member states apply different
 * rates to different food categories (e.g. DE applies 7% to most food but 19%
 * to some items). A tax advisor must confirm the correct rate per product
 * category and destination country before these are used in production invoices.
 *
 * Source: https://taxation-customs.ec.europa.eu/taxation/vat/vat-rates_en
 */
export const EU_FOOD_VAT_RATES: Record<string, number> = { ...foodVatRates };

/**
 * Returns the food VAT rate for a destination country.
 * Falls back to a conservative 20% standard rate if the country is unknown.
 *
 * COMPLIANCE-REVIEW: The fallback rate is intentionally conservative (high).
 * Do not ship to a country without confirming the correct rate first.
 */
export function getFoodVatRate(destinationCountryIso2: string): number {
  const rate = EU_FOOD_VAT_RATES[destinationCountryIso2.toUpperCase()];
  if (rate === undefined) {
    // COMPLIANCE-REVIEW: Unknown country — using conservative fallback.
    // Do not allow checkout to an unknown country without legal review.
    return 0.20;
  }
  return rate;
}

export interface FoodVatCalculation {
  rate: number;
  vatAmountEur: number;
  grossAmountEur: number;
}

/**
 * Calculates destination-country VAT for a VAT-exclusive food subtotal.
 * Monetary values are rounded to cents for display and payment totals.
 *
 * COMPLIANCE-REVIEW: Confirm whether production invoices must round per line
 * or per invoice, and whether delivery charges share the food item's VAT rate.
 */
export function calculateFoodVat(
  netAmountEur: number,
  destinationCountryIso2: string,
): FoodVatCalculation {
  if (!Number.isFinite(netAmountEur) || netAmountEur < 0) {
    throw new RangeError('VAT-exclusive amount must be a non-negative finite number');
  }

  const rate = getFoodVatRate(destinationCountryIso2);
  const vatAmountEur = Math.round((netAmountEur * rate + Number.EPSILON) * 100) / 100;
  const grossAmountEur = Math.round((netAmountEur + vatAmountEur + Number.EPSILON) * 100) / 100;

  return { rate, vatAmountEur, grossAmountEur };
}

/**
 * Determines whether a seller has crossed the OSS threshold and must switch
 * to destination-country VAT reporting.
 *
 * @param annualCrossBorderSalesEur - Combined cross-border sales (goods + TBE services) in EUR
 */
export function requiresOssReporting(annualCrossBorderSalesEur: number): boolean {
  return annualCrossBorderSalesEur > OSS_THRESHOLD_EUR;
}

/**
 * Determines whether a seller is reportable under DAC7.
 * A seller is excluded only if BOTH the transaction count AND consideration
 * thresholds are below the limits.
 */
export function isDAC7Reportable(
  transactionCount: number,
  totalConsiderationEur: number,
): boolean {
  return (
    transactionCount >= DAC7_THRESHOLDS.maxTransactions ||
    totalConsiderationEur > DAC7_THRESHOLDS.maxConsiderationEur
  );
}
