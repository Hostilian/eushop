package com.eushop.core.websocket;

import com.eushop.core.dto.MessageResponse;
import com.eushop.core.entity.Message;
import com.eushop.core.service.ConversationService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ConversationService conversationService;

    public WebSocketController(SimpMessagingTemplate messagingTemplate,
                              ConversationService conversationService) {
        this.messagingTemplate = messagingTemplate;
        this.conversationService = conversationService;
    }

    /**
     * Handle sending a message via WebSocket
     * @param messageRequest The message payload
     * @param principal The authenticated user
     */
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload MessageRequest messageRequest, Principal principal) {
        // Validate the message
        if (messageRequest == null || messageRequest.getContent() == null ||
            messageRequest.getContent().trim().isEmpty() || messageRequest.getConversationId() == null) {
            return;
        }

        // Validate that the user is part of the conversation
        if (!conversationService.isUserInConversation(principal.getName(), messageRequest.getConversationId())) {
            return;
        }

        // Save the message
        Message message = conversationService.addMessage(
                messageRequest.getConversationId(),
                principal.getName(),
                messageRequest.getContent()
        );

        // Convert to DTO
        MessageResponse response = new MessageResponse(message);

        // Notify both participants
        messagingTemplate.convertAndSendToUser(
                message.getConversation().getBuyer().getId(),
                "/queue/messages",
                response
        );

        messagingTemplate.convertAndSendToUser(
                message.getConversation().getSeller().getId(),
                "/queue/messages",
                response
        );
    }

    /**
     * Handle typing indicators
     * @param typingRequest The typing indicator payload
     * @param principal The authenticated user
     */
    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload TypingRequest typingRequest, Principal principal) {
        if (typingRequest == null || typingRequest.getConversationId() == null) {
            return;
        }

        // Validate that the user is part of the conversation
        if (!conversationService.isUserInConversation(principal.getName(), typingRequest.getConversationId())) {
            return;
        }

        // Notify the other participant
        String otherUserId = conversationService.getOtherUserInConversation(
                principal.getName(),
                typingRequest.getConversationId()
        );

        if (otherUserId != null) {
            TypingResponse response = new TypingResponse(
                    typingRequest.getConversationId(),
                    principal.getName(),
                    typingRequest.isTyping()
            );

            messagingTemplate.convertAndSendToUser(
                    otherUserId,
                    "/queue/typing",
                    response
            );
        }
    }

    /**
     * Handle message read receipts
     * @param readRequest The read receipt payload
     * @param principal The authenticated user
     */
    @MessageMapping("/chat.read")
    public void handleMessageRead(@Payload ReadRequest readRequest, Principal principal) {
        if (readRequest == null || readRequest.getConversationId() == null) {
            return;
        }

        // Mark messages as read
        conversationService.markAsRead(readRequest.getConversationId(), principal.getName());

        // Notify the other participant
        String otherUserId = conversationService.getOtherUserInConversation(
                principal.getName(),
                readRequest.getConversationId()
        );

        if (otherUserId != null) {
            ReadResponse response = new ReadResponse(
                    readRequest.getConversationId(),
                    principal.getName()
            );

            messagingTemplate.convertAndSendToUser(
                    otherUserId,
                    "/queue/read",
                    response
            );
        }
    }

    /**
     * Handle message reactions
     * @param reactionRequest The reaction payload
     * @param principal The authenticated user
     */
    @MessageMapping("/chat.react")
    public void handleReaction(@Payload ReactionRequest reactionRequest, Principal principal) {
        if (reactionRequest == null || reactionRequest.getMessageId() == null || reactionRequest.getReaction() == null) {
            return;
        }

        // Add reaction
        Message message = conversationService.addReaction(
                reactionRequest.getMessageId(),
                principal.getName(),
                reactionRequest.getReaction()
        );

        if (message != null) {
            // Convert to DTO with reactions
            MessageResponse response = new MessageResponse(message);

            // Notify both participants
            messagingTemplate.convertAndSendToUser(
                    message.getConversation().getBuyer().getId(),
                    "/queue/reactions",
                    response
            );

            messagingTemplate.convertAndSendToUser(
                    message.getConversation().getSeller().getId(),
                    "/queue/reactions",
                    response
            );
        }
    }
}

// Request and Response DTOs
class MessageRequest {
    private String conversationId;
    private String content;

    // Getters and setters
    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}

class TypingRequest {
    private String conversationId;
    private boolean typing;

    // Getters and setters
    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public boolean isTyping() {
        return typing;
    }

    public void setTyping(boolean typing) {
        this.typing = typing;
    }
}

class ReadRequest {
    private String conversationId;

    // Getters and setters
    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }
}

class TypingResponse {
    private String conversationId;
    private String userId;
    private boolean typing;

    public TypingResponse(String conversationId, String userId, boolean typing) {
        this.conversationId = conversationId;
        this.userId = userId;
        this.typing = typing;
    }

    // Getters
    public String getConversationId() {
        return conversationId;
    }

    public String getUserId() {
        return userId;
    }

    public boolean isTyping() {
        return typing;
    }
}

class ReadResponse {
    private String conversationId;
    private String userId;

    public ReadResponse(String conversationId, String userId) {
        this.conversationId = conversationId;
        this.userId = userId;
    }

    // Getters
    public String getConversationId() {
        return conversationId;
    }

    public String getUserId() {
        return userId;
    }
}
