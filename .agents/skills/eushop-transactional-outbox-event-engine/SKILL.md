---
name: eushop-transactional-outbox-event-engine
description: PostgreSQL Transactional Outbox & Event-Driven Message Engine for EUshop
---

# PostgreSQL Transactional Outbox Event Engine

## Overview
EUshop uses the transactional outbox pattern to guarantee reliable, at-least-once event delivery without dual-write problems. Business state changes (orders, products, payouts) are persisted atomically with an outbox event record in the same PostgreSQL transaction, then polled and dispatched to external systems.

## Outbox Table Schema

```sql
-- db/migrations/V010__create_outbox_events.sql
CREATE TABLE outbox_events (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type VARCHAR(100) NOT NULL,  -- 'Order', 'Product', 'Seller', 'Payout'
    aggregate_id   UUID NOT NULL,
    event_type     VARCHAR(100) NOT NULL,  -- 'CREATED', 'UPDATED', 'DELETED', 'PAID'
    payload        JSONB NOT NULL,
    status         VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING, DISPATCHED, FAILED
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    dispatched_at  TIMESTAMPTZ,
    retry_count    SMALLINT NOT NULL DEFAULT 0,
    last_error     TEXT
);

-- Partial index for polling efficiency
CREATE INDEX CONCURRENTLY idx_outbox_pending
    ON outbox_events (created_at ASC)
    WHERE status = 'PENDING';
```

## Atomic Write Pattern

```java
// services/core-service/src/order/OrderService.java
@Transactional
public Order createOrder(CreateOrderRequest request) {
    // 1. Validate and persist business entity
    Order order = orderRepository.save(buildOrder(request));

    // 2. Persist outbox event IN THE SAME TRANSACTION
    outboxEventRepository.save(OutboxEvent.builder()
        .aggregateType("Order")
        .aggregateId(order.getId())
        .eventType("CREATED")
        .payload(objectMapper.valueToTree(OrderCreatedEvent.from(order)))
        .build());

    // Both saves commit together or both roll back — no dual-write problem
    return order;
}
```

## Event Poller & Dispatcher

```java
// services/core-service/src/outbox/OutboxPoller.java
@Scheduled(fixedDelay = 500)  // Poll every 500ms
@Transactional
public void pollAndDispatch() {
    List<OutboxEvent> pendingEvents = outboxEventRepository
        .findTop50ByStatusOrderByCreatedAtAsc(OutboxEventStatus.PENDING);

    for (OutboxEvent event : pendingEvents) {
        try {
            eventPublisher.publish(event);
            event.markDispatched();
        } catch (Exception e) {
            event.recordFailure(e.getMessage());
            // Exponential backoff via retry_count — max 10 retries
        }
        outboxEventRepository.save(event);
    }
}
```

## Deduplication at Consumer Side

```typescript
// Consumers must be idempotent — deduplication by event ID
export async function handleOrderCreatedEvent(event: OutboxEvent): Promise<void> {
  const alreadyProcessed = await processedEventRepository.exists(event.id);
  if (alreadyProcessed) return; // Idempotent — skip duplicate

  await fulfillmentService.startFulfillment(event.aggregateId);
  await processedEventRepository.save(event.id);
}
```

## Dead Letter Queue (DLQ)

```java
// Events that fail more than 10 retries → move to DLQ table for manual review
if (event.getRetryCount() >= 10) {
    event.setStatus(OutboxEventStatus.DEAD_LETTER);
    alertService.notifyOpsTeam("Outbox DLQ entry: " + event.getId());
}
```

## Source Files
- `db/migrations/V010__create_outbox_events.sql`
- `services/core-service/src/outbox/OutboxPoller.java`
- `services/core-service/src/outbox/OutboxEventRepository.java`
- See also: `transactional-outbox-pattern.md` knowledge item
