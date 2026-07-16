package com.eushop.core.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eushop.core.entity.Conversation;
import com.eushop.core.entity.Message;
import com.eushop.core.entity.User;
import com.eushop.core.repository.ConversationRepository;
import com.eushop.core.repository.MessageRepository;
import com.eushop.core.repository.UserRepository;

@Service
@Transactional
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ConversationParticipantRepository conversationParticipantRepository;

    public ConversationService(ConversationRepository conversationRepository, MessageRepository messageRepository,
            UserRepository userRepository, ConversationParticipantRepository conversationParticipantRepository) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.conversationParticipantRepository = conversationParticipantRepository;
    }

    public Conversation createConversation(String buyerId, String sellerId, String subject) {
        Optional<User> buyer = userRepository.findById(buyerId);
        Optional<User> seller = userRepository.findById(sellerId);

        if (buyer.isEmpty() || seller.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        Conversation conversation = new Conversation(buyer.get(), seller.get(), subject);
        return conversationRepository.save(conversation);
    }

    public Optional<Conversation> getConversationById(String id) {
        return conversationRepository.findById(id);
    }

    public List<Conversation> getConversationsByBuyer(String buyerId) {
        return conversationRepository.findByBuyerIdOrderByLastMessageAtDesc(buyerId);
    }

    public List<Conversation> getConversationsBySeller(String sellerId) {
        return conversationRepository.findBySellerIdOrderByLastMessageAtDesc(sellerId);
    }

    public List<Conversation> getActiveConversationsByUser(String userId) {
        return conversationRepository.findActiveConversationsByUser(userId);
    }

    public Conversation addMessage(String conversationId, String senderId, String content) {
        Optional<Conversation> convOpt = conversationRepository.findById(conversationId);
        Optional<User> senderOpt = userRepository.findById(senderId);

        if (convOpt.isEmpty() || senderOpt.isEmpty()) {
            throw new RuntimeException("Conversation or User not found");
        }

        Conversation conversation = convOpt.get();
        Message message = new Message(conversation, senderOpt.get(), content);
        messageRepository.save(message);

        // Update conversation's last message
        conversation.setLastMessage(content);
        conversation.setLastMessageAt(LocalDateTime.now());
        return conversationRepository.save(conversation);
    }

    public List<Message> getConversationHistory(String conversationId) {
        return messageRepository.getConversationHistory(conversationId);
    }

    public Long getUnreadMessageCount(String conversationId, String userId) {
        return messageRepository.getUnreadMessageCount(conversationId, userId);
    }

    public void markAsRead(String conversationId, String userId) {
        messageRepository.markConversationAsRead(conversationId, userId);
    }

    public void closeConversation(String conversationId) {
        Optional<Conversation> conv = conversationRepository.findById(conversationId);
        if (conv.isPresent()) {
            Conversation conversation = conv.get();
            conversation.setIsActive(false);
            conversationRepository.save(conversation);
        }
    }

    /**
     * Check if a user is part of a conversation
     * @param userId The user ID to check
     * @param conversationId The conversation ID
     * @return true if the user is part of the conversation
     */
    public boolean isUserInConversation(String userId, String conversationId) {
        Optional<Conversation> conversation = conversationRepository.findById(conversationId);
        return conversation.map(conv ->
            conv.getBuyer().getId().equals(userId) || conv.getSeller().getId().equals(userId)
        ).orElse(false);
    }

    /**
     * Get the other user in a conversation
     * @param userId The current user ID
     * @param conversationId The conversation ID
     * @return The ID of the other user, or null if not found
     */
    public String getOtherUserInConversation(String userId, String conversationId) {
        Optional<Conversation> conversation = conversationRepository.findById(conversationId);
        if (conversation.isPresent()) {
            Conversation conv = conversation.get();
            if (conv.getBuyer().getId().equals(userId)) {
                return conv.getSeller().getId();
            } else if (conv.getSeller().getId().equals(userId)) {
                return conv.getBuyer().getId();
            }
        }
        return null;
    }

    /**
     * Add a reaction to a message
     * @param messageId The message ID
     * @param userId The user ID adding the reaction
     * @param reaction The reaction emoji
     * @return The updated message
     */
    public Message addReaction(String messageId, String userId, String reaction) {
        Optional<Message> messageOpt = messageRepository.findById(messageId);
        if (messageOpt.isEmpty()) {
            return null;
        }

        Message message = messageOpt.get();

        // Check if user is part of the conversation
        if (!isUserInConversation(userId, message.getConversation().getId())) {
            return null;
        }

        // Get or create reactions map
        Map<String, Object> metadata = message.getMetadata();
        if (metadata == null) {
            metadata = new HashMap<>();
        }

        Map<String, Integer> reactions;
        if (metadata.containsKey("reactions")) {
            reactions = (Map<String, Integer>) metadata.get("reactions");
        } else {
            reactions = new HashMap<>();
        }

        // Update reaction count
        reactions.put(reaction, reactions.getOrDefault(reaction, 0) + 1);

        // Update metadata
        metadata.put("reactions", reactions);
        message.setMetadata(metadata);

        return messageRepository.save(message);
    }

    /**
     * Create a group conversation
     * @param name Group name
     * @param description Group description
     * @param participantIds List of participant IDs
     * @param createdBy User ID who created the group
     * @return The created conversation
     */
    public Conversation createGroupConversation(String name, String description, List<String> participantIds, String createdBy) {
        // Validate participants
        if (participantIds == null || participantIds.size() < 2) {
            throw new IllegalArgumentException("Group must have at least 2 participants");
        }

        // Create conversation
        Conversation conversation = new Conversation();
        conversation.setIsGroup(true);
        conversation.setGroupName(name);
        conversation.setGroupDescription(description);
        conversation.setCreatedBy(createdBy);
        conversation.setSubject("Group: " + name);
        conversation.setIsActive(true);
        conversation.setCreatedAt(LocalDateTime.now());
        conversation.setUpdatedAt(LocalDateTime.now());

        // Save conversation
        Conversation savedConversation = conversationRepository.save(conversation);

        // Add participants
        for (String participantId : participantIds) {
            addGroupParticipant(savedConversation.getId(), participantId, "member");
        }

        // Set creator as admin
        addGroupParticipant(savedConversation.getId(), createdBy, "owner");

        return savedConversation;
    }

    /**
     * Add participant to a group
     * @param conversationId Conversation ID
     * @param userId User ID to add
     * @param role Participant role
     */
    private void addGroupParticipant(String conversationId, String userId, String role) {
        ConversationParticipant participant = new ConversationParticipant();
        participant.setConversationId(conversationId);
        participant.setUserId(userId);
        participant.setRole(role);
        conversationParticipantRepository.save(participant);
    }

    /**
     * Get group information
     * @param conversationId Conversation ID
     * @return Map with group information
     */
    public Map<String, Object> getGroupInfo(String conversationId) {
        Optional<Conversation> conversationOpt = conversationRepository.findById(conversationId);
        if (conversationOpt.isEmpty() || !conversationOpt.get().getIsGroup()) {
            throw new IllegalArgumentException("Group not found");
        }

        Conversation conversation = conversationOpt.get();
        List<ConversationParticipant> participants = conversationParticipantRepository.findByConversationId(conversationId);

        List<Map<String, Object>> participantInfo = participants.stream()
                .map(p -> {
                    Map<String, Object> info = new HashMap<>();
                    info.put("id", p.getUserId());
                    info.put("role", p.getRole());
                    return info;
                })
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("id", conversation.getId());
        result.put("name", conversation.getGroupName());
        result.put("description", conversation.getGroupDescription());
        result.put("imageUrl", conversation.getGroupImageUrl());
        result.put("participants", participantInfo);
        result.put("isGroup", conversation.getIsGroup());
        result.put("createdBy", conversation.getCreatedBy());
        result.put("createdAt", conversation.getCreatedAt());

        return result;
    }

    /**
     * Update group information
     * @param conversationId Conversation ID
     * @param name New group name
     * @param description New group description
     * @return The updated conversation
     */
    public Conversation updateGroupInfo(String conversationId, String name, String description) {
        Optional<Conversation> conversationOpt = conversationRepository.findById(conversationId);
        if (conversationOpt.isEmpty() || !conversationOpt.get().getIsGroup()) {
            throw new IllegalArgumentException("Group not found");
        }

        Conversation conversation = conversationOpt.get();
        conversation.setGroupName(name);
        conversation.setGroupDescription(description);
        conversation.setUpdatedAt(LocalDateTime.now());

        return conversationRepository.save(conversation);
    }

    /**
     * Add participants to a group
     * @param conversationId Conversation ID
     * @param participantIds List of user IDs to add
     */
    public void addGroupParticipants(String conversationId, List<String> participantIds) {
        for (String userId : participantIds) {
            addGroupParticipant(conversationId, userId, "member");
        }
    }

    /**
     * Remove participant from a group
     * @param conversationId Conversation ID
     * @param userId User ID to remove
     */
    public void removeGroupParticipant(String conversationId, String userId) {
        conversationParticipantRepository.deleteByConversationIdAndUserId(conversationId, userId);
    }

    /**
     * Leave a group conversation
     * @param conversationId Conversation ID
     */
    public void leaveGroupConversation(String conversationId) {
        // In a real implementation, we would check if the user is the owner
        // and handle ownership transfer or group deletion
        // For now, just remove the participant
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            String currentUserId = authentication.getName();
            removeGroupParticipant(conversationId, currentUserId);
        }
    }

    /**
     * Edit a message
     * @param messageId Message ID
     * @param newContent New message content
     */
    public void editMessage(String messageId, String newContent) {
        Optional<Message> messageOpt = messageRepository.findById(messageId);
        if (messageOpt.isEmpty()) {
            throw new IllegalArgumentException("Message not found");
        }

        Message message = messageOpt.get();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.getName().equals(message.getSender().getId())) {
            throw new SecurityException("You can only edit your own messages");
        }

        // Check if user is still part of the conversation
        if (!isUserInConversation(authentication.getName(), message.getConversation().getId())) {
            throw new SecurityException("You are no longer part of this conversation");
        }

        message.setContent(newContent);
        messageRepository.save(message);
    }

    /**
     * Delete a message
     * @param messageId Message ID
     */
    public void deleteMessage(String messageId) {
        Optional<Message> messageOpt = messageRepository.findById(messageId);
        if (messageOpt.isEmpty()) {
            throw new IllegalArgumentException("Message not found");
        }

        Message message = messageOpt.get();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.getName().equals(message.getSender().getId())) {
            throw new SecurityException("You can only delete your own messages");
        }

        // Check if user is still part of the conversation
        if (!isUserInConversation(authentication.getName(), message.getConversation().getId())) {
            throw new SecurityException("You are no longer part of this conversation");
        }

        messageRepository.delete(message);
    }
}
