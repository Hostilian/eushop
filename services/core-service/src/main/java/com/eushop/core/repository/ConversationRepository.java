package com.eushop.core.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.eushop.core.entity.Conversation;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, String> {

    List<Conversation> findByBuyerIdOrderByLastMessageAtDesc(String buyerId);

    List<Conversation> findBySellerIdOrderByLastMessageAtDesc(String sellerId);

    @Query("SELECT c FROM Conversation c WHERE (c.buyer.id = :userId OR c.seller.id = :userId) AND c.isActive = true ORDER BY c.lastMessageAt DESC")
    List<Conversation> findActiveConversationsByUser(@Param("userId") String userId);

    @Query("SELECT c FROM Conversation c WHERE c.buyer.id = :buyerId AND c.seller.id = :sellerId")
    Conversation findConversationBetweenUsers(@Param("buyerId") String buyerId, @Param("sellerId") String sellerId);

    /**
     * GDPR Article 17 — Right to Erasure.
     * Clears PII from conversations (subject, last_message, group_name, group_description)
     * for a given user.
     * Called when a user exercises their right to be forgotten.
     */
    @Transactional
    @Modifying
    @Query("UPDATE Conversation c SET c.subject = NULL, c.lastMessage = NULL, c.groupName = NULL, c.groupDescription = NULL WHERE c.buyer.id = :userId OR c.seller.id = :userId")
    void updateConversationPiiWhereBuyerIdOrSellerId(@Param("userId") String userId);
}
