package com.eushop.core.repository;

import com.eushop.core.entity.ConsentLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsentLogRepository extends JpaRepository<ConsentLog, String> {
    List<ConsentLog> findByUserIdOrderByCreatedAtDesc(String userId);
}
