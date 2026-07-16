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

    public ConversationService(ConversationRepository conversationRepository, MessageRepository messageRepository,
            UserRepository userRepository) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
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
}
