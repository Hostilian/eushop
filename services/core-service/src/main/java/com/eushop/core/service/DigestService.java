package com.eushop.core.service;

import com.eushop.core.entity.User;
import com.eushop.core.repository.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DigestService {

    private final UserRepository userRepository;
    private final ConversationService conversationService;
    private final EmailService emailService;

    public DigestService(UserRepository userRepository, ConversationService conversationService, EmailService emailService) {
        this.userRepository = userRepository;
        this.conversationService = conversationService;
        this.emailService = emailService;
    }

    @Scheduled(cron = "0 0 9 * * *") // Run every day at 9:00 AM
    public void sendSellerDigests() {
        List<User> sellers = userRepository.findAllSellers();
        for (User seller : sellers) {
            sendDigestToSeller(seller);
        }
    }

    private void sendDigestToSeller(User seller) {
        // In a real implementation, we would have a more sophisticated way to get unread messages.
        // For now, we'll just get all active conversations for the seller.
        long unreadCount = conversationService.getActiveConversationsByUser(seller.getId())
                .stream()
                .mapToLong(conversation -> conversationService.getUnreadMessageCount(conversation.getId(), seller.getId()))
                .sum();

        if (unreadCount > 0) {
            String subject = "You have " + unreadCount + " unread messages";
            String body = "You have " + unreadCount + " unread messages. Please log in to your EUshop account to reply.";
            emailService.sendEmail(seller.getEmail(), subject, body);
        }
    }
}
