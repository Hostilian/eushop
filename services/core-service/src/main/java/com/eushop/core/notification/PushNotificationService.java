package com.eushop.core.notification;

import com.eushop.core.entity.User;
import com.eushop.core.repository.UserRepository;
import com.google.firebase.messaging.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class PushNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(PushNotificationService.class);

    private final FirebaseMessaging firebaseMessaging;
    private final UserRepository userRepository;

    public PushNotificationService(FirebaseMessaging firebaseMessaging, UserRepository userRepository) {
        this.firebaseMessaging = firebaseMessaging;
        this.userRepository = userRepository;
    }

    /**
     * Send push notification to a user
     * @param userId Recipient user ID
     * @param title Notification title
     * @param body Notification body
     * @param data Additional data
     * @param url URL to navigate when notification is clicked
     */
    public void sendPushNotification(String userId, String title, String body,
                                   Map<String, Object> data, String url) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty() || userOpt.get().getFcmToken() == null) {
                return;
            }

            User user = userOpt.get();
            String fcmToken = user.getFcmToken();

            // Create notification message
            Notification notification = new Notification(title, body);

            // Create message with data
            Message message = Message.builder()
                    .setToken(fcmToken)
                    .setNotification(notification)
                    .putAllData(data)
                    .putData("url", url)
                    .putData("click_action", "FLUTTER_NOTIFICATION_CLICK")
                    .build();

            // Send message
            String response = firebaseMessaging.send(message);
            logger.info("Successfully sent push notification to user {}: {}", userId, response);
        } catch (FirebaseMessagingException e) {
            logger.error("Failed to send push notification to user {}: {}", userId, e.getMessage());
            // Handle token refresh if needed
            if (e.getMessagingErrorCode() == MessagingErrorCode.UNREGISTERED) {
                // Token is no longer valid, update user record
                userRepository.findById(userId).ifPresent(user -> {
                    user.setFcmToken(null);
                    userRepository.save(user);
                });
            }
        } catch (Exception e) {
            logger.error("Error sending push notification to user {}: {}", userId, e.getMessage());
        }
    }

    /**
     * Send push notification to multiple users
     * @param userIds List of user IDs
     * @param title Notification title
     * @param body Notification body
     * @param data Additional data
     * @param url URL to navigate when notification is clicked
     */
    public void sendPushNotificationToUsers(List<String> userIds, String title, String body,
                                          Map<String, Object> data, String url) {
        userIds.forEach(userId -> sendPushNotification(userId, title, body, data, url));
    }

    /**
     * Subscribe user to a topic
     * @param userId User ID
     * @param topic Topic name
     */
    public void subscribeToTopic(String userId, String topic) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty() || userOpt.get().getFcmToken() == null) {
                return;
            }

            String fcmToken = userOpt.get().getFcmToken();
            firebaseMessaging.subscribeToTopic(List.of(fcmToken), topic);
            logger.info("Subscribed user {} to topic {}", userId, topic);
        } catch (FirebaseMessagingException e) {
            logger.error("Failed to subscribe user {} to topic {}: {}", userId, topic, e.getMessage());
        }
    }

    /**
     * Unsubscribe user from a topic
     * @param userId User ID
     * @param topic Topic name
     */
    public void unsubscribeFromTopic(String userId, String topic) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty() || userOpt.get().getFcmToken() == null) {
                return;
            }

            String fcmToken = userOpt.get().getFcmToken();
            firebaseMessaging.unsubscribeFromTopic(List.of(fcmToken), topic);
            logger.info("Unsubscribed user {} from topic {}", userId, topic);
        } catch (FirebaseMessagingException e) {
            logger.error("Failed to unsubscribe user {} from topic {}: {}", userId, topic, e.getMessage());
        }
    }
}