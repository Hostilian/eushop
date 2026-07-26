# Next.js Internationalization Route Architecture

## Overview
EUshop serves buyers across all 27 EU member states. next-i18next handles locale routing on the Pages Router with static export.

## Supported Locales
```js
// next-i18next.config.js
module.exports = {
  i18n: {
    locales: ['en', 'de', 'fr', 'it', 'pl', 'nl', 'es', 'pt', 'cs', 'ro', 'hu'],
    defaultLocale: 'en',
    localeDetection: true,
  },
};
```

## Route Structure
- `/en/products/[id]`
- `/de/produkte/[id]`
- `/fr/produits/[id]`

## Static Export Locale Paths
```js
// pages/products/[id].tsx
export async function getStaticPaths() {
  const locales = ['en', 'de', 'fr', ...];
  const products = await getAllProducts();
  return {
    paths: products.flatMap(p => locales.map(locale => ({ params: { id: p.id }, locale }))),
    fallback: false,
  };
}
```

## Translation File Structure
```
public/locales/
  en/
    common.json  (nav, footer, shared UI)
    product.json (product page strings)
    compliance.json (allergen names, legal disclaimers — NEVER auto-translate)
  de/
    ...
```

## Compliance Translations
Allergen names must use official EU translations per Reg. 1169/2011 — NEVER rely on generic MT.
