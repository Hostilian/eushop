package com.eushop.core.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eushop.core.dto.ApiResponse;
import com.eushop.core.entity.Conversation;
import com.eushop.core.entity.Message;
import com.eushop.core.service.ConversationService;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    private final ConversationService conversationService;

    public ConversationController(ConversationService conversationService) {
        this.conversationService = conversationService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Conversation>> createConversation(
            @RequestBody ConversationRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        Conversation conversation = conversationService.createConversation(
                request.getBuyerId(),
                request.getSellerId(),
                request.getSubject());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(conversation, "Conversation created"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Conversation>> getConversation(@PathVariable String id) {
        return conversationService.getConversationById(id)
                .map(conv -> ResponseEntity.ok(ApiResponse.success(conv)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Conversation not found")));
    }

    @GetMapping("/buyer/{buyerId}")
    public ResponseEntity<ApiResponse<List<Conversation>>> getConversationsByBuyer(
            @PathVariable String buyerId) {
        List<Conversation> conversations = conversationService.getConversationsByBuyer(buyerId);
        return ResponseEntity.ok(ApiResponse.success(conversations));
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<ApiResponse<List<Conversation>>> getConversationsBySeller(
            @PathVariable String sellerId) {
        List<Conversation> conversations = conversationService.getConversationsBySeller(sellerId);
        return ResponseEntity.ok(ApiResponse.success(conversations));
    }

    @GetMapping("/user/{userId}/active")
    public ResponseEntity<ApiResponse<List<Conversation>>> getActiveConversations(
            @PathVariable String userId) {
        List<Conversation> conversations = conversationService.getActiveConversationsByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(conversations));
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<ApiResponse<Conversation>> addMessage(
            @PathVariable String id,
            @RequestBody MessageRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        Conversation conversation = conversationService.addMessage(id, userId, request.getContent());
        return ResponseEntity.ok(ApiResponse.success(conversation, "Message added"));
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<ApiResponse<List<Message>>> getMessages(@PathVariable String id) {
        List<Message> messages = conversationService.getConversationHistory(id);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> closeConversation(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        conversationService.closeConversation(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    // Request DTOs
    public static class ConversationRequest {
        private String buyerId;
        private String sellerId;
        private String subject;

        public String getBuyerId() {
            return buyerId;
        }

        public void setBuyerId(String buyerId) {
            this.buyerId = buyerId;
        }

        public String getSellerId() {
            return sellerId;
        }

        public void setSellerId(String sellerId) {
            this.sellerId = sellerId;
        }

        public String getSubject() {
            return subject;
        }

        public void setSubject(String subject) {
            this.subject = subject;
        }
    }

    public static class MessageRequest {
        private String content;

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }
    }
}
