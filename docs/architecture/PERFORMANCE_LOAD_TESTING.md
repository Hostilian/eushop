# EUshop Performance & Load Testing Strategy (k6 / Gatling)

**Target Load SLA:** p50 < 50ms, p95 < 150ms @ 100 Virtual Users (VU)  
**N+1 Query Prevention:** JPA EntityGraph & `@BatchSize(size = 25)` fetch optimization  

---

## 1. k6 Load Testing Execution

Run load test against local backend (Port 3001):
```bash
k6 run scripts/load-test-k6.js
```

---

## 2. Query Plan & N+1 Bottleneck Mitigation

To prevent N+1 queries during seller listing discovery:
1. `Food` entity uses `@ManyToOne(fetch = FetchType.LAZY)` for seller relations.
2. `Order` entity fetches `OrderItems` using JOIN FETCH in custom JPA repository queries.
