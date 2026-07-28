---
name: eushop-i18n-multilingual-localization
description: Next.js i18n Multilingual Localization & Locale Routing Skill for EUshop
---

# Next.js i18n Multilingual Localization

## Overview
EUshop targets all 27 EU member states across 24 official EU languages. The Next.js Pages Router i18n system routes users to locale-specific pages while compliance strings (allergen warnings, legal disclosures) must be available in the buyer's language.

## Next.js i18n Configuration

```javascript
// apps/web/next.config.js
module.exports = {
  i18n: {
    locales: [
      'en', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'sv', 'da',
      'fi', 'nb', 'el', 'cs', 'sk', 'hu', 'ro', 'bg', 'hr', 'sl',
      'et', 'lv', 'lt', 'mt', 'ga',
    ],
    defaultLocale: 'en',
    localeDetection: true,
    // COMPLIANCE-REVIEW: Auto-redirect is blocked by Geo-Blocking Reg. 2018/302 — use localeDetection for
    // preference only, never hard-redirect without user consent
  },
};
```

## Translation File Structure

```
apps/web/public/locales/
  en/
    common.json      # Navigation, buttons, general UI
    product.json     # Product detail labels
    compliance.json  # Legal/compliance strings (allergens, warnings)
    checkout.json    # Checkout flow labels
  de/
    ...
  fr/
    ...
```

## Compliance Translation Rules

```typescript
// packages/compliance/src/i18n.ts
// CRITICAL: Compliance strings (allergen warnings, legal disclaimers)
// must NEVER fall back to English silently — missing translations must be flagged

export function getComplianceString(
  key: string,
  locale: string,
  translations: Record<string, Record<string, string>>
): string {
  const localeStrings = translations[locale];
  const value = localeStrings?.[key];

  if (!value) {
    // COMPLIANCE-REVIEW: Missing compliance translation is a legal risk
    // Log as error, alert compliance team, return English as last resort
    console.error(`COMPLIANCE_I18N_MISSING: key="${key}" locale="${locale}"`);
    return translations['en']?.[key] ?? `[MISSING: ${key}]`;
  }

  return value;
}
```

## RTL Support (Arabic, Hebrew — if future expansion)

```typescript
// For future non-EU market expansion
// Avoid hard-coded 'ltr' assumptions in CSS
// Use CSS logical properties: margin-inline-start instead of margin-left
```

## Number & Currency Formatting

```typescript
// packages/types/src/i18n.ts
export function formatPrice(
  amountEUR: number,
  locale: string,
  currency: string = 'EUR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountEUR);
}
// Always format prices server-side or via SSR to avoid hydration mismatches
```

## Date Formatting

```typescript
export function formatOrderDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
// Never hardcode date formats (DD/MM/YYYY vs MM/DD/YYYY)
```

## Translation Completeness CI Check

```bash
# In CI: check no locale is missing compliance keys
node scripts/check-compliance-translations.js \
  --required-keys packages/compliance/src/i18n-keys.json \
  --locales-dir apps/web/public/locales \
  --fail-on-missing
```

## Source Files
- `apps/web/next.config.js` — i18n configuration
- `apps/web/public/locales/` — translation files
- `packages/compliance/src/i18n.ts` — compliance string utilities
- See also: `nextjs-i18n-route-architecture.md` knowledge item
