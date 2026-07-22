package com.eushop.core.service;

import com.eushop.core.entity.OutboxEvent;
import com.eushop.core.repository.OutboxEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * OutboxEventService guarantees atomic domain event persistence within the same SQL transaction block.
 */
@Service
public class OutboxEventService {

    @Autowired
    private OutboxEventRepository outboxEventRepository;

    @Transactional
    public OutboxEvent publishEvent(String aggregateType, String aggregateId, String eventType, String payload) {
        OutboxEvent event = new OutboxEvent();
        event.setAggregateType(aggregateType);
        event.setAggregateId(aggregateId);
        event.setEventType(eventType);
        event.setPayload(payload);

        return outboxEventRepository.save(event);
    }

    @Transactional
    public void markProcessed(String eventId) {
        outboxEventRepository.findById(eventId).ifPresent(event -> {
            event.setProcessedAt(LocalDateTime.now());
            outboxEventRepository.save(event);
        });
    }
}
