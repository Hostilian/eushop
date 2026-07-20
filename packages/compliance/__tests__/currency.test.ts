import { formatEuCurrency, convertFromEur, EU_EXCHANGE_RATES_TO_EUR } from '../src/currency';

describe('EU Single Market Currency Conversion & Formatting Engine (Task 65)', () => {
  it('converts EUR correctly to CZK, PLN, and DKK', () => {
    expect(convertFromEur(10, 'EUR')).toBe(10);
    expect(convertFromEur(10, 'CZK')).toBe(252);
    expect(convertFromEur(10, 'PLN')).toBe(43);
    expect(convertFromEur(10, 'DKK')).toBe(74.6);
  });

  it('formats currency strings adhering to local EU conventions', () => {
    expect(formatEuCurrency(12.5, 'EUR')).toBe('€12.50');
    expect(formatEuCurrency(10, 'CZK')).toBe('252 Kč');
    expect(formatEuCurrency(10, 'PLN')).toBe('43.00 zł');
    expect(formatEuCurrency(10, 'SEK')).toBe('114 kr');
    expect(formatEuCurrency(10, 'DKK')).toBe('74.60 kr.');
  });
});
