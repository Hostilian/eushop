package com.eushop.core.dto;

import java.time.LocalDateTime;

public class ConversationDTO {
    private String id;
    private String buyerId;
    private String buyerName;
    private String sellerId;
    private String sellerName;
    private String subject;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private Boolean isActive;

    public ConversationDTO(String id, String buyerId, String buyerName, String sellerId,
            String sellerName, String subject, String lastMessage, LocalDateTime lastMessageAt,
            Boolean isActive) {
        this.id = id;
        this.buyerId = buyerId;
        this.buyerName = buyerName;
        this.sellerId = sellerId;
        this.sellerName = sellerName;
        this.subject = subject;
        this.lastMessage = lastMessage;
        this.lastMessageAt = lastMessageAt;
        this.isActive = isActive;
    }

    // Getters
    public String getId() {
        return id;
    }

    public String getBuyerId() {
        return buyerId;
    }

    public String getBuyerName() {
        return buyerName;
    }

    public String getSellerId() {
        return sellerId;
    }

    public String getSellerName() {
        return sellerName;
    }

    public String getSubject() {
        return subject;
    }

    public String getLastMessage() {
        return lastMessage;
    }

    public LocalDateTime getLastMessageAt() {
        return lastMessageAt;
    }

    public Boolean getIsActive() {
        return isActive;
    }
}
