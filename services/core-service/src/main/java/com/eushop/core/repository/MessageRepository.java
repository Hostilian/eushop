package com.eushop.core.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.eushop.core.entity.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, String> {

    List<Message> findByConversationIdOrderByCreatedAtDesc(String conversationId);

    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId ORDER BY m.createdAt ASC")
    List<Message> getConversationHistory(@Param("conversationId") String conversationId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.id = :conversationId AND m.isRead = false AND m.sender.id != :userId")
    Long getUnreadMessageCount(@Param("conversationId") String conversationId, @Param("userId") String userId);

    @Query("UPDATE Message m SET m.isRead = true, m.readAt = CURRENT_TIMESTAMP WHERE m.conversation.id = :conversationId AND m.sender.id != :userId")
    void markConversationAsRead(@Param("conversationId") String conversationId, @Param("userId") String userId);

    /**
     * GDPR Article 17 — Right to Erasure.
     * Clears PII from messages (content, attachments) for a given user.
     * Called when a user exercises their right to be forgotten.
     */
    @Transactional
    @Modifying
    @Query("UPDATE Message m SET m.content = NULL, m.metadata = NULL WHERE m.sender.id = :userId")
    void updateMessagePiiWhereSenderId(@Param("userId") String userId);
}