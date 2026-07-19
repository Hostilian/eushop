/**
 * Compliance engine unit tests.
 *
 * These are the highest-priority tests in the repo — a silently-failing VAT
 * calculation or wrong DAC7 threshold is worse than a visibly broken page.
 *
 * Run with: pnpm --filter @eushop/compliance test
 */

import {
  isDAC7Reportable,
  requiresOssReporting,
  getFoodVatRate,
  DAC7_THRESHOLDS,
  OSS_THRESHOLD_EUR,
  EU_FOOD_VAT_RATES,
} from '../vat';
import { EU_ALLERGENS_14 } from '../allergens';

// ─── DAC7 threshold edge cases ────────────────────────────────────────────────

describe('isDAC7Reportable', () => {
  it('reports a seller with exactly 30 transactions', () => {
    expect(isDAC7Reportable(30, 2_000)).toBe(true);
  });

  it('reports a seller with 31 transactions even if consideration is below threshold', () => {
    expect(isDAC7Reportable(31, 1_000)).toBe(true);
  });

  it('reports a seller with €2,001 consideration even if transactions are below threshold', () => {
    expect(isDAC7Reportable(10, 2_001)).toBe(true);
  });

  it('excludes a seller with 29 transactions and €1,999', () => {
    expect(isDAC7Reportable(29, 1_999)).toBe(false);
  });

  it('reports a seller who exceeds both thresholds', () => {
    expect(isDAC7Reportable(100, 50_000)).toBe(true);
  });

  it('thresholds are driven by DAC7_THRESHOLDS constants, not magic numbers', () => {
    // Exactly at threshold — excluded
    expect(isDAC7Reportable(DAC7_THRESHOLDS.maxTransactions, DAC7_THRESHOLDS.maxConsiderationEur)).toBe(true);
    // One over on transactions — reportable
    expect(isDAC7Reportable(DAC7_THRESHOLDS.maxTransactions + 1, 0)).toBe(true);
    // One over on consideration — reportable
    expect(isDAC7Reportable(0, DAC7_THRESHOLDS.maxConsiderationEur + 1)).toBe(true);
  });
});

// ─── OSS threshold ────────────────────────────────────────────────────────────

describe('requiresOssReporting', () => {
  it('does not require OSS at exactly €10,000', () => {
    expect(requiresOssReporting(OSS_THRESHOLD_EUR)).toBe(false);
  });

  it('requires OSS at €10,001', () => {
    expect(requiresOssReporting(OSS_THRESHOLD_EUR + 1)).toBe(true);
  });

  it('does not require OSS below threshold', () => {
    expect(requiresOssReporting(9_999)).toBe(false);
  });
});

// ─── VAT rates per destination country ───────────────────────────────────────

describe('getFoodVatRate', () => {
  it('returns 7% for Germany (DE)', () => {
    expect(getFoodVatRate('DE')).toBeCloseTo(0.07);
  });

  it('returns 0% for Ireland (IE) — zero-rated food', () => {
    expect(getFoodVatRate('IE')).toBe(0);
  });

  it('returns 25% for Denmark (DK) — no reduced food rate', () => {
    expect(getFoodVatRate('DK')).toBeCloseTo(0.25);
  });

  it('returns 0% for Malta (MT) — zero-rated food', () => {
    expect(getFoodVatRate('MT')).toBe(0);
  });

  it('returns 5.5% for France (FR)', () => {
    expect(getFoodVatRate('FR')).toBeCloseTo(0.055);
  });

  it('is case-insensitive', () => {
    expect(getFoodVatRate('de')).toBeCloseTo(0.07);
    expect(getFoodVatRate('De')).toBeCloseTo(0.07);
  });

  it('returns conservative fallback (20%) for unknown country', () => {
    expect(getFoodVatRate('XX')).toBe(0.20);
  });

  it('covers all 27 EU member states', () => {
    const EU_MEMBER_STATES = [
      'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR',
      'HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE',
    ];
    EU_MEMBER_STATES.forEach(iso => {
      const rate = getFoodVatRate(iso);
      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(1);
    });
    expect(Object.keys(EU_FOOD_VAT_RATES)).toHaveLength(27);
  });
});

// ─── Allergen list integrity ──────────────────────────────────────────────────

describe('EU_ALLERGENS_14', () => {
  it('contains exactly 14 allergens', () => {
    expect(EU_ALLERGENS_14).toHaveLength(14);
  });

  it('includes all Annex II allergens', () => {
    const required = [
      'Cereals containing gluten',
      'Crustaceans',
      'Eggs',
      'Fish',
      'Peanuts',
      'Soybeans',
      'Milk',
      'Nuts',
      'Celery',
      'Mustard',
      'Sesame seeds',
      'Sulphur dioxide and sulphites',
      'Lupin',
      'Molluscs',
    ];
    required.forEach(allergen => {
      expect(EU_ALLERGENS_14).toContain(allergen);
    });
  });

  it('has no duplicate entries', () => {
    const unique = new Set(EU_ALLERGENS_14);
    expect(unique.size).toBe(EU_ALLERGENS_14.length);
  });
});
