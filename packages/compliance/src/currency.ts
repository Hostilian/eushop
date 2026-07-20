/**
 * EU Single Market Currency Engine.
 * Single source of truth for EU Member State exchange rates and formatting rules.
 *
 * COMPLIANCE-REVIEW: Prices displayed to consumers in non-Euro EU Member States
 * (e.g. CZ, PL, SE, DK, HU, BG, RO) must show clear local currency equivalents
 * or standard EUR pricing with statutory tax disclosures.
 */

export type EUCurrency = 'EUR' | 'CZK' | 'PLN' | 'SEK' | 'DKK' | 'HUF' | 'BGN' | 'RON';

/**
 * Standard indicative ECB exchange rates relative to 1 EUR.
 * COMPLIANCE-REVIEW: Rates are updated periodically; in production, sync with ECB daily API.
 */
export const EU_EXCHANGE_RATES_TO_EUR: Record<EUCurrency, number> = {
  EUR: 1.0,
  CZK: 25.2,  // Czech Koruna
  PLN: 4.30,  // Polish Zloty
  SEK: 11.40, // Swedish Krona
  DKK: 7.46,  // Danish Krone
  HUF: 395.0, // Hungarian Forint
  BGN: 1.95583, // Bulgarian Lev (pegged to EUR)
  RON: 4.97,  // Romanian Leu
};

/**
 * ISO 3166-1 alpha-2 country to default EU currency mapping.
 */
export const EU_COUNTRY_CURRENCY_MAP: Record<string, EUCurrency> = {
  CZ: 'CZK',
  PL: 'PLN',
  SE: 'SEK',
  DK: 'DKK',
  HU: 'HUF',
  BG: 'BGN',
  RO: 'RON',
  // All Eurozone members default to EUR
  DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', BE: 'EUR', NL: 'EUR', AT: 'EUR',
  IE: 'EUR', FI: 'EUR', PT: 'EUR', GR: 'EUR', SK: 'EUR', SI: 'EUR', CY: 'EUR',
  MT: 'EUR', EE: 'EUR', LV: 'EUR', LT: 'EUR', HR: 'EUR',
};

/**
 * Converts a EUR price to the specified target EU currency.
 */
export function convertFromEur(amountInEur: number, targetCurrency: EUCurrency): number {
  const rate = EU_EXCHANGE_RATES_TO_EUR[targetCurrency] || 1.0;
  return Math.round(amountInEur * rate * 100) / 100;
}

/**
 * Formats a numeric price into a localized currency string adhering to EU locale conventions.
 */
export function formatEuCurrency(amountInEur: number, currency: EUCurrency = 'EUR'): string {
  const converted = convertFromEur(amountInEur, currency);

  switch (currency) {
    case 'CZK':
      return `${Math.round(converted)} Kč`;
    case 'PLN':
      return `${converted.toFixed(2)} zł`;
    case 'SEK':
      return `${Math.round(converted)} kr`;
    case 'DKK':
      return `${converted.toFixed(2)} kr.`;
    case 'HUF':
      return `${Math.round(converted)} Ft`;
    case 'BGN':
      return `${converted.toFixed(2)} лв.`;
    case 'RON':
      return `${converted.toFixed(2)} lei`;
    case 'EUR':
    default:
      return `€${amountInEur.toFixed(2)}`;
  }
}
