package com.eushop.core.controller;

import com.eushop.core.dto.ApiResponse;
import com.eushop.core.service.ConversationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/conversations")
public class GroupChatController {

    private final ConversationService conversationService;

    public GroupChatController(ConversationService conversationService) {
        this.conversationService = conversationService;
    }

    /**
     * Create a group conversation
     * @param request The group creation request
     * @return API response with created group
     */
    @PostMapping("/group")
    public ResponseEntity<ApiResponse<Object>> createGroupConversation(
            @RequestBody GroupConversationRequest request) {
        try {
            Object result = conversationService.createGroupConversation(
                    request.getName(),
                    request.getDescription(),
                    request.getParticipantIds(),
                    request.getCreatedBy()
            );
            return ResponseEntity.ok(ApiResponse.success(result, "Group created successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to create group: " + e.getMessage()));
        }
    }

    /**
     * Get group information
     * @param conversationId The conversation ID
     * @return API response with group information
     */
    @GetMapping("/{conversationId}/group-info")
    public ResponseEntity<ApiResponse<Object>> getGroupInfo(@PathVariable String conversationId) {
        try {
            Object result = conversationService.getGroupInfo(conversationId);
            return ResponseEntity.ok(ApiResponse.success(result, "Group info retrieved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to get group info: " + e.getMessage()));
        }
    }

    /**
     * Update group information
     * @param conversationId The conversation ID
     * @param request The update request
     * @return API response with updated group
     */
    @PutMapping("/{conversationId}/group-info")
    public ResponseEntity<ApiResponse<Object>> updateGroupInfo(
            @PathVariable String conversationId,
            @RequestBody UpdateGroupRequest request) {
        try {
            Object result = conversationService.updateGroupInfo(
                    conversationId,
                    request.getName(),
                    request.getDescription()
            );
            return ResponseEntity.ok(ApiResponse.success(result, "Group updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to update group: " + e.getMessage()));
        }
    }

    /**
     * Add participants to a group
     * @param conversationId The conversation ID
     * @param request The participant IDs to add
     * @return API response
     */
    @PostMapping("/{conversationId}/participants")
    public ResponseEntity<ApiResponse<Void>> addGroupParticipants(
            @PathVariable String conversationId,
            @RequestBody Map<String, List<String>> request) {
        try {
            conversationService.addGroupParticipants(conversationId, request.get("participantIds"));
            return ResponseEntity.ok(ApiResponse.success(null, "Participants added successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to add participants: " + e.getMessage()));
        }
    }

    /**
     * Remove participant from a group
     * @param conversationId The conversation ID
     * @param userId The user ID to remove
     * @return API response
     */
    @DeleteMapping("/{conversationId}/participants/{userId}")
    public ResponseEntity<ApiResponse<Void>> removeGroupParticipant(
            @PathVariable String conversationId,
            @PathVariable String userId) {
        try {
            conversationService.removeGroupParticipant(conversationId, userId);
            return ResponseEntity.ok(ApiResponse.success(null, "Participant removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to remove participant: " + e.getMessage()));
        }
    }

    /**
     * Leave a group conversation
     * @param conversationId The conversation ID
     * @return API response
     */
    @PostMapping("/{conversationId}/leave")
    public ResponseEntity<ApiResponse<Void>> leaveGroupConversation(@PathVariable String conversationId) {
        try {
            conversationService.leaveGroupConversation(conversationId);
            return ResponseEntity.ok(ApiResponse.success(null, "Left group successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to leave group: " + e.getMessage()));
        }
    }

    // Request DTOs
    public static class GroupConversationRequest {
        private String name;
        private String description;
        private List<String> participantIds;
        private String createdBy;

        // Getters and setters
        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public List<String> getParticipantIds() {
            return participantIds;
        }

        public void setParticipantIds(List<String> participantIds) {
            this.participantIds = participantIds;
        }

        public String getCreatedBy() {
            return createdBy;
        }

        public void setCreatedBy(String createdBy) {
            this.createdBy = createdBy;
        }
    }

    public static class UpdateGroupRequest {
        private String name;
        private String description;

        // Getters and setters
        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }
}