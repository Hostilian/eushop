# Transactional Outbox Pattern Implementation

## Overview
EUshop uses the transactional outbox pattern to guarantee reliable event delivery from Spring Boot to downstream services (email, analytics, external APIs).

## Database Schema
```sql
CREATE TABLE outbox_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type TEXT NOT NULL,
    aggregate_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    retry_count INT DEFAULT 0,
    error_message TEXT
);
CREATE INDEX CONCURRENTLY idx_outbox_pending ON outbox_events (status, created_at)
WHERE status = 'PENDING';
```

## Publishing Pattern
```java
@Transactional
public void placeOrder(Order order) {
    orderRepository.save(order); // business data
    outboxEventRepository.save(new OutboxEvent( // event in same transaction
        "Order", order.getId(), "ORDER_PLACED", toJson(order)
    ));
    // Commit atomically — no lost events
}
```

## Polling Cron
- Poll interval: 5 seconds
- Max retries: 3
- Backoff: exponential (1s, 2s, 4s)
- Dead letter: after 3 failures → `outbox_dead_letters` table
