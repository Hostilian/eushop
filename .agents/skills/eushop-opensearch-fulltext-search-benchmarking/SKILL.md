---
name: eushop-opensearch-fulltext-search-benchmarking
description: Full-Text Search Benchmarking & OpenSearch Query Engine Skill for EUshop
---

# OpenSearch Full-Text Search & Benchmarking Engine

## Overview
EUshop uses OpenSearch for product full-text search with multilingual support, allergen filtering, and relevance-scored results. This skill governs index configuration, query patterns, and performance benchmarking.

## Index Configuration

```json
// OpenSearch index settings for products
{
  "settings": {
    "analysis": {
      "analyzer": {
        "eu_food_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "eu_stop", "trigram_filter"]
        }
      },
      "filter": {
        "trigram_filter": {
          "type": "ngram",
          "min_gram": 3,
          "max_gram": 3
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "name": { "type": "text", "analyzer": "eu_food_analyzer" },
      "description": { "type": "text", "analyzer": "eu_food_analyzer" },
      "allergens": { "type": "keyword" },
      "dietary_flags": { "type": "keyword" },
      "origin_country": { "type": "keyword" },
      "price_eur": { "type": "float" },
      "seller_id": { "type": "keyword" }
    }
  }
}
```

## Allergen-Safe Search Query

```typescript
// services/core-service/src/search/ProductSearchService.ts
export function buildAllergenSafeQuery(
  searchTerm: string,
  userAllergens: string[]
): OpenSearchQuery {
  return {
    query: {
      bool: {
        must: [
          {
            multi_match: {
              query: searchTerm,
              fields: ['name^3', 'description^1', 'brand^2'],
              type: 'best_fields',
              fuzziness: 'AUTO',
            },
          },
        ],
        must_not: userAllergens.map(allergen => ({
          term: { allergens: allergen },
        })),
        // COMPLIANCE-REVIEW: Allergen filter is a safety-critical feature
        // Never allow user allergen list to be empty due to a bug — fail closed
      },
    },
    sort: [
      { _score: { order: 'desc' } },
      { 'price_eur': { order: 'asc' } },
    ],
  };
}
```

## Faceted Search (Filters)

```typescript
// Aggregations for sidebar filters
export const PRODUCT_SEARCH_AGGREGATIONS = {
  aggs: {
    by_origin: {
      terms: { field: 'origin_country', size: 30 }
    },
    by_dietary_flags: {
      terms: { field: 'dietary_flags', size: 20 }
    },
    price_range: {
      histogram: { field: 'price_eur', interval: 10 }
    },
    by_seller: {
      terms: { field: 'seller_id', size: 10 }
    },
  },
};
```

## Performance Benchmarks (SLOs)

| Query Type | P95 Target | P99 Target |
|-----------|-----------|-----------|
| Full-text search | < 100ms | < 250ms |
| Allergen-filtered search | < 150ms | < 300ms |
| Autocomplete (prefix) | < 50ms | < 100ms |
| Category browse | < 75ms | < 150ms |

## Search Relevance Tuning

```typescript
// Boost recent products and high-rated sellers
export const SEARCH_BOOST_FACTORS = {
  recencyBoostDays: 30,         // Boost products listed in last 30 days
  sellerRatingBoostThreshold: 4.5, // Boost products from sellers rated ≥4.5
  verifiedSellerBoost: 1.3,     // 30% relevance boost for verified DSA Art. 30 sellers
};
```

## Indexing Pipeline

- Products are indexed via outbox events: `Product.CREATED` → index, `Product.UPDATED` → re-index, `Product.DELETED` → delete from index
- Reindex via `POST /api/v1/admin/search/reindex` (admin only, rate-limited)
- Index health checked in CI via `GET /_cluster/health`

## Source Files
- `services/core-service/src/search/ProductSearchService.java`
- `services/core-service/src/search/OpenSearchIndexConfig.java`
- `apps/web/components/search/SearchBar.tsx`
- See also: `opensearch-product-search-config.md` knowledge item
