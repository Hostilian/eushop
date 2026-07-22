package com.eushop.core.repository;

import com.eushop.core.entity.OutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OutboxEventRepository extends JpaRepository<OutboxEvent, String> {

    List<OutboxEvent> findByProcessedAtIsNullOrderByCreatedAtAsc();
}
