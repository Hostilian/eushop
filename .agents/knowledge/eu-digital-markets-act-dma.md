# EU Digital Markets Act (DMA) Compliance Reference

## Overview
The Digital Markets Act (EU 2022/1925) imposes obligations on "gatekeepers". EUshop itself is unlikely to be a gatekeeper but must comply with interoperability and fair ranking obligations if it relies on gatekeeper platforms.

## Relevant DMA Obligations for EUshop
1. **Fair ranking**: Product ranking algorithms must be based on objective criteria. Never demote products because seller doesn't use EUshop's own paid services.
2. **Data portability**: Sellers must be able to export all their data in machine-readable format.
3. **Self-preferencing prohibition**: If EUshop offers competing products, they may not appear preferentially.
4. **No MFN clauses**: Cannot require sellers to offer lowest prices only on EUshop.
5. **Interoperability**: Must allow sellers to use third-party logistics and payment services.

## Ranking Algorithm Transparency
```sql
-- Ranking factors must be documented and objective
-- Example: score = (reviews_avg * 0.4) + (conversion_rate * 0.3) + (fulfillment_speed * 0.3)
-- NOT: premium sellers ranked higher just because they pay more
```

// COMPLIANCE-REVIEW: EUshop's DMA applicability and obligations with legal counsel
