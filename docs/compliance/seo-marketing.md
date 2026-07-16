# EUshop — SEO & Marketing Strategy

---

## SEO Checklist

| Task | Status | Priority | Notes |
|---|---|---|---|
| XML sitemap | ✅ Created | P0 | `scripts/generate-sitemap.js` |
| robots.txt | ✅ Created | P0 | `apps/web/public/robots.txt` |
| Structured data (JSON-LD) | ⏳ In progress | P0 | See examples below |
| Meta descriptions per page | ⚠️ Partial | P0 | Remove compliance claims |
| H1 tags | ✅ Present | P1 | Verify uniqueness per page |
| Alt text on all images | ❌ Missing | P0 | Add to ProductCard, food detail |
| hreflang tags | ❌ Missing | P1 | Required for multi-language |
| Canonical URLs | ❌ Missing | P1 | Prevent duplicate content |
| Google Analytics 4 | ❌ Missing | P0 | Add GA4 tracking |
| Google Search Console | ❌ Missing | P0 | Submit sitemap |
| Core Web Vitals monitoring | ❌ Missing | P1 | Lighthouse CI added to pipeline |
| Open Graph tags | ⚠️ Partial | P1 | Remove unverified compliance claims |

---

## Structured Data Examples (JSON-LD)

### Product page (`/food/[id]`)

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Artisanal Belgian Chocolates",
  "description": "Fine handmade pralines crafted by master chocolatiers in Brussels.",
  "image": "https://hostilian.github.io/eushop/images/belgian_chocolates.png",
  "brand": {
    "@type": "Brand",
    "name": "Brussels Praline Co."
  },
  "offers": {
    "@type": "Offer",
    "url": "https://hostilian.github.io/eushop/food/1/",
    "priceCurrency": "EUR",
    "price": "24.99",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition",
    "seller": {
      "@type": "Organization",
      "name": "Brussels Praline Co."
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "12"
  }
}
```

### Organisation (homepage `_app.tsx`)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "EUshop",
  "url": "https://hostilian.github.io/eushop/",
  "logo": "https://hostilian.github.io/eushop/images/logo.png",
  "description": "Pan-European artisanal food marketplace connecting independent producers with consumers across the EU Single Market.",
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "support@eushop.com",
    "contactType": "customer service"
  }
}
```

### Breadcrumb (product pages)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://hostilian.github.io/eushop/" },
    { "@type": "ListItem", "position": 2, "name": "Browse", "item": "https://hostilian.github.io/eushop/search/" },
    { "@type": "ListItem", "position": 3, "name": "Artisanal Belgian Chocolates", "item": "https://hostilian.github.io/eushop/food/1/" }
  ]
}
```

> **COMPLIANCE-REVIEW:** Do not include compliance claims (DSA-compliant,
> allergen-disclosed, etc.) in structured data. Search-engine-facing metadata
> making false regulatory claims is the same problem as on-page copy.

---

## KPIs Table

| Metric | Month 1 target | Month 3 target | Month 6 target | Measurement |
|---|---|---|---|---|
| Organic sessions | 2,000 | 8,000 | 20,000 | GA4 |
| Total sessions | 5,000 | 15,000 | 40,000 | GA4 |
| Product page views | 10,000 | 40,000 | 100,000 | GA4 |
| Add-to-cart rate | 4% | 6% | 8% | GA4 events |
| Checkout completion | 20% | 28% | 35% | GA4 funnel |
| Conversion rate | 1% | 1.8% | 2.5% | GA4 |
| Average order value | €55 | €65 | €75 | Stripe |
| Active sellers | 15 | 40 | 80 | DB |
| Active buyers | 300 | 1,000 | 3,000 | DB |
| Seller verification rate | 100% | 100% | 100% | DB (compliance KPI) |
| Allergen disclosure rate | 100% | 100% | 100% | DB (compliance KPI) |
| GDPR request response time | <30 days | <30 days | <30 days | Support log |

---

## Content Calendar (First 3 Months)

| Week | Theme | Content | Channel |
|---|---|---|---|
| 1 | Launch | Homepage copy rewrite (plain language, no acronyms) | Web |
| 1 | Launch | 10 product pages with full FIC Art.14 disclosure | Web |
| 2 | Regional | French cheese guide (Brie, Camembert, Comté) | Blog |
| 2 | Regional | Italian pantry staples guide | Blog |
| 3 | Seller | First 5 seller spotlight stories | Web + social |
| 4 | Seasonal | Summer artisanal food guide | Blog |
| 5 | Trust | "How we verify every seller" explainer | Web |
| 6 | Regional | Spanish charcuterie guide | Blog |
| 7 | Seasonal | Back-to-school lunchbox ideas | Blog |
| 8 | Seller | 5 more seller spotlights | Web + social |
| 9 | Regional | Belgian chocolate guide | Blog |
| 10 | Trust | "Understanding allergen labels" buyer guide | Blog |
| 11 | Seasonal | Autumn harvest specialties | Blog |
| 12 | Launch | 3-month review + new seller recruitment push | Email + social |

---

## Keyword Strategy

### Primary (high intent, EU food marketplace)
- "artisanal food marketplace Europe"
- "buy specialty food online EU"
- "European artisanal food delivery"
- "verified food producers EU"

### Secondary (product category)
- "buy French cheese online"
- "Italian balsamic vinegar delivery"
- "Spanish manchego cheese online"
- "Belgian chocolate marketplace"
- "German black forest ham delivery"

### Long-tail (high conversion)
- "where to buy authentic Manchego cheese online"
- "best place to order Italian Prosciutto di Parma"
- "gluten-free artisanal food EU delivery"
- "nut-free European specialty foods"

---

## Analytics Setup (GA4)

### Events to track

```javascript
// Add to cart
gtag('event', 'add_to_cart', {
  currency: 'EUR',
  value: price,
  items: [{ item_id: id, item_name: name, price, quantity }]
});

// Begin checkout
gtag('event', 'begin_checkout', { currency: 'EUR', value: total });

// Purchase
gtag('event', 'purchase', {
  transaction_id: orderId,
  currency: 'EUR',
  value: total,
  items: cartItems
});

// Allergen filter used (compliance insight)
gtag('event', 'allergen_filter_applied', { allergen: allergenName });

// Seller verification viewed
gtag('event', 'seller_verification_viewed', { seller_id: sellerId });
```

### Goals to configure in GA4
1. Purchase completed
2. Add to cart
3. Seller onboarding started
4. Seller onboarding completed
5. GDPR data export requested
