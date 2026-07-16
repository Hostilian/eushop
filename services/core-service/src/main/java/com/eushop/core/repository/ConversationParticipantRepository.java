package com.eushop.core.repository;

import com.eushop.core.entity.ConversationParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, String> {

    List<ConversationParticipant> findByConversationId(String conversationId);

    List<ConversationParticipant> findByUserId(String userId);

    void deleteByConversationIdAndUserId(String conversationId, String userId);

    boolean existsByConversationIdAndUserId(String conversationId, String userId);
}