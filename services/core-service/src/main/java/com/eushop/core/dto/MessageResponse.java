package com.eushop.core.dto;

import java.util.List;
import java.util.stream.Collectors;

import com.eushop.core.entity.Message;

public class MessageResponse {
    private String id;
    private String conversationId;
    private String senderId;
    private String content;
    private boolean isRead;
    private String createdAt;
    private List<MessageReactionDto> reactions;

    public MessageResponse(Message message) {
        this.id = message.getId();
        this.conversationId = message.getConversation().getId();
        this.senderId = message.getSender().getId();
        this.content = message.getContent();
        this.isRead = message.getIsRead();
        this.createdAt = message.getCreatedAt().toString();
        this.reactions = message.getReactions().stream()
                .map(MessageReactionDto::new)
                .collect(Collectors.toList());
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

    public List<MessageReactionDto> getReactions() {
        return reactions;
    }

    public void setReactions(List<MessageReactionDto> reactions) {
        this.reactions = reactions;
    }
}
