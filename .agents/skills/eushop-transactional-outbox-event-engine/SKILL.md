---
name: eushop-transactional-outbox-event-engine
description: PostgreSQL Transactional Outbox & Event-Driven Message Engine for EUshop
---

# PostgreSQL Transactional Outbox Engine

This skill implements reliable event publishing using the transactional outbox pattern.

## Rules
1. **Atomic DB Writes**: Persist business entity state and outbox event record in the exact same database transaction.
2. **At-Least-Once Delivery**: Polling process dispatches events to external message queues with deduplication IDs.
