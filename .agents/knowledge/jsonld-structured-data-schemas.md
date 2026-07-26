# JSON-LD Structured Data Schemas for EUshop

## Overview
EUshop implements JSON-LD structured data on all key page types for SEO rich results.

## Product Page Schema
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Kalamata Extra Virgin Olive Oil",
  "description": "PDO-certified olive oil from Kalamata region",
  "brand": { "@type": "Brand", "name": "Farmhouse Olive" },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "EUR",
    "price": "24.99",
    "availability": "https://schema.org/InStock",
    "seller": { "@type": "Organization", "name": "Farmhouse Olive" }
  },
  "countryOfOrigin": { "@type": "Country", "name": "Greece" }
}
</script>
```

## Homepage Schema
```json
{
  "@type": "Organization",
  "name": "EUshop",
  "url": "https://hostilian.github.io/eushop",
  "logo": "https://hostilian.github.io/eushop/logo.png",
  "description": "European artisan food marketplace"
}
```

## Implementation
- Use `next/head` to inject JSON-LD in `<head>`
- Validate with Google Rich Results Test
- One schema per page type — no duplicates
