---
name: eushop-redis-caching-strategy
description: Redis Caching Strategy & Cache Invalidation Patterns for EUshop — defines TTLs, cache-aside patterns, and invalidation triggers.
---

# Redis Caching Strategy

## Overview
EUshop uses Redis for product catalog caching, session storage, and rate limiting counters.

## Cache Tiers & TTLs
| Data Type | TTL | Invalidation Trigger |
|-----------|-----|---------------------|
| Product detail | 5 min | Product update event |
| Product list/search | 1 min | Any product update |
| Seller profile | 10 min | Seller profile update |
| VAT rates | 24h | Manual admin trigger |
| Allergen data | 1h | compliance package update |
| User session | 24h | Logout / JWT expiry |
| Rate limit counter | 1 min | Rolling window |

## Cache-Aside Pattern (Spring Boot)
```java
@Cacheable(value = "products", key = "#id", unless = "#result == null")
public ProductDTO getProduct(UUID id) {
    return productRepository.findById(id)
        .map(productMapper::toDTO)
        .orElse(null);
}

@CacheEvict(value = "products", key = "#product.id")
public void updateProduct(Product product) {
    productRepository.save(product);
    outboxEventRepository.save(new OutboxEvent("Product", product.getId(), "UPDATED", ...));
}
```

## Key Naming Convention
`eushop:{entity}:{id}` — e.g. `eushop:product:550e8400-e29b-41d4-a716`

## Never Cache
- Payment data
- Auth tokens
- GDPR-flagged user data
