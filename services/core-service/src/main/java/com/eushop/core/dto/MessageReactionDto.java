package com.eushop.core.dto;

import com.eushop.core.entity.MessageReaction;

public class MessageReactionDto {
    private String userId;
    private String reaction;

    public MessageReactionDto(MessageReaction messageReaction) {
        this.userId = messageReaction.getUser().getId();
        this.reaction = messageReaction.getReaction();
    }

    // Getters and setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getReaction() {
        return reaction;
    }

    public void setReaction(String reaction) {
        this.reaction = reaction;
    }
}
