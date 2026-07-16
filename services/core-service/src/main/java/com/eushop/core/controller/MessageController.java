package com.eushop.core.controller;

import com.eushop.core.dto.ApiResponse;
import com.eushop.core.service.ConversationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final ConversationService conversationService;

    public MessageController(ConversationService conversationService) {
        this.conversationService = conversationService;
    }

    /**
     * Edit a message
     * @param messageId The message ID
     * @param request The edit request
     * @return API response
     */
    @PutMapping("/{messageId}")
    public ResponseEntity<ApiResponse<Void>> editMessage(
            @PathVariable String messageId,
            @RequestBody EditMessageRequest request) {
        try {
            conversationService.editMessage(messageId, request.getContent());
            return ResponseEntity.ok(ApiResponse.success(null, "Message updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to edit message: " + e.getMessage()));
        }
    }

    /**
     * Delete a message
     * @param messageId The message ID
     * @return API response
     */
    @DeleteMapping("/{messageId}")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(@PathVariable String messageId) {
        try {
            conversationService.deleteMessage(messageId);
            return ResponseEntity.ok(ApiResponse.success(null, "Message deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to delete message: " + e.getMessage()));
        }
    }

    // Request DTO
    public static class EditMessageRequest {
        private String content;

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }
    }
}