package com.eushop.core.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eushop.core.entity.Conversation;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, String> {
    
    List<Conversation> findByBuyerIdOrderByLastMessageAtDesc(String buyerId);
    
    List<Conversation> findBySellerIdOrderByLastMessageAtDesc(String sellerId);
    
    @Query("SELECT c FROM Conversation c WHERE (c.buyer.id = :userId OR c.seller.id = :userId) AND c.isActive = true ORDER BY c.lastMessageAt DESC")
    List<Conversation> findActiveConversationsByUser(@Param("userId") String userId);
    
    @Query("SELECT c FROM Conversation c WHERE c.buyer.id = :buyerId AND c.seller.id = :sellerId")
    Conversation findConversationBetweenUsers(@Param("buyerId") String buyerId, @Param("sellerId") String sellerId);
}
