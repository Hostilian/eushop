# OpenSearch Product Search Configuration

## Overview
EUshop uses OpenSearch for full-text product search with multi-language support across 24 EU languages.

## Index Mapping
```json
{
  "mappings": {
    "properties": {
      "name": { "type": "text", "analyzer": "standard" },
      "description": { "type": "text", "analyzer": "standard" },
      "origin_country": { "type": "keyword" },
      "allergens": { "type": "keyword" },
      "seller_name": { "type": "text" },
      "price_eur": { "type": "scaled_float", "scaling_factor": 100 },
      "pdo_pgi_status": { "type": "keyword" },
      "location": { "type": "geo_point" }
    }
  }
}
```

## Query Strategy
```json
{
  "query": {
    "bool": {
      "must": { "multi_match": { "query": "$search", "fields": ["name^3", "description"] }},
      "filter": [
        { "term": { "allergens": "$excluded_allergen" }},
        { "geo_distance": { "distance": "500km", "location": "$user_location" }}
      ]
    }
  }
}
```

## Performance Targets
- Search latency p95: < 100ms
- Index refresh interval: 1s (real-time search)
- Shard count: 3 primary, 1 replica
