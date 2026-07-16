package com.eushop.core.dto;

import java.util.Map;

public class MessageResponse {
    private String id;
    private String conversationId;
    private String senderId;
    private String content;
    private boolean isRead;
    private String createdAt;
    private Map<String, Integer> reactions;

    public MessageResponse(String id, String conversationId, String senderId, String content,
                          boolean isRead, String createdAt) {
        this.id = id;
        this.conversationId = conversationId;
        this.senderId = senderId;
        this.content = content;
        this.isRead = isRead;
        this.createdAt = createdAt;
        this.reactions = Map.of();
    }

    public MessageResponse(String id, String conversationId, String senderId, String content,
                          boolean isRead, String createdAt, Map<String, Integer> reactions) {
        this.id = id;
        this.conversationId = conversationId;
        this.senderId = senderId;
        this.content = content;
        this.isRead = isRead;
        this.createdAt = createdAt;
        this.reactions = reactions;
    }

    // Getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public Map<String, Integer> getReactions() {
        return reactions;
    }

    public void setReactions(Map<String, Integer> reactions) {
        this.reactions = reactions;
    }
}