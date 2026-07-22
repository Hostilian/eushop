import { z } from 'zod';

/**
 * Currency-aware Money Value Object schema.
 * Guarantees strict 2-decimal scale rounding and valid ISO 4217 currency code.
 */
export const MoneySchema = z.object({
  amount: z.number().multipleOf(0.01, { message: 'Amount must have at most 2 decimal places' }),
  currency: z.enum(['EUR', 'USD', 'GBP']).default('EUR'),
});

export type Money = z.infer<typeof MoneySchema>;

export function formatMoney(money: Money, locale: string = 'de-DE'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: money.currency,
  }).format(money.amount);
}
