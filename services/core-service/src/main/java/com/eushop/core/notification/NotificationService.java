package com.eushop.core.notification;

import com.eushop.core.entity.Notification;
import com.eushop.core.entity.User;
import com.eushop.core.repository.NotificationRepository;
import com.eushop.core.repository.UserRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final PushNotificationService pushNotificationService;
    private final EmailNotificationService emailNotificationService;

    public NotificationService(NotificationRepository notificationRepository,
                              UserRepository userRepository,
                              PushNotificationService pushNotificationService,
                              EmailNotificationService emailNotificationService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.pushNotificationService = pushNotificationService;
        this.emailNotificationService = emailNotificationService;
    }

    /**
     * Create and send a notification
     * @param userId Recipient user ID
     * @param type Notification type
     * @param title Notification title
     * @param message Notification message
     * @param data Additional notification data
     * @param url URL to navigate when notification is clicked
     */
    @Async("notificationExecutor")
    @Transactional
    public void createNotification(String userId, String type, String title, String message,
                                 Map<String, Object> data, String url) {
        // Save notification to database
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setData(data);
        notification.setUrl(url);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notification);

        // Get user preferences
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return;

        User user = userOpt.get();
        NotificationPreferences preferences = getNotificationPreferences(user);

        // Send push notification if enabled
        if (preferences.isPushEnabled() && preferences.isTypeEnabled(type)) {
            pushNotificationService.sendPushNotification(userId, title, message, data, url);
        }

        // Send email notification if enabled and user is offline
        if (preferences.isEmailEnabled() && preferences.isTypeEnabled(type) && !isUserOnline(userId)) {
            emailNotificationService.sendEmailNotification(user, title, message, url);
        }
    }

    /**
     * Get notification preferences for a user
     * @param user The user
     * @return Notification preferences
     */
    private NotificationPreferences getNotificationPreferences(User user) {
        // In a real implementation, this would come from user preferences
        // For now, use default preferences
        return new NotificationPreferences(
            true, // pushEnabled
            true, // emailEnabled
            true  // all types enabled
        );
    }

    /**
     * Check if user is online
     * @param userId User ID
     * @return true if user is online
     */
    private boolean isUserOnline(String userId) {
        // In a real implementation, this would check WebSocket connections
        // or last activity timestamp
        return false;
    }

    /**
     * Mark notification as read
     * @param notificationId Notification ID
     */
    @Transactional
    public void markAsRead(String notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
    }

    /**
     * Mark all notifications as read for a user
     * @param userId User ID
     */
    @Transactional
    public void markAllAsRead(String userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadFalse(userId);
        notifications.forEach(notification -> {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
        });
        notificationRepository.saveAll(notifications);
    }

    /**
     * Get unread notifications count for a user
     * @param userId User ID
     * @return Unread count
     */
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    /**
     * Get notifications for a user
     * @param userId User ID
     * @param limit Maximum number of notifications to return
     * @return List of notifications
     */
    public List<Notification> getNotifications(String userId, int limit) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, limit);
    }

    /**
     * Notification preferences DTO
     */
    private static class NotificationPreferences {
        private final boolean pushEnabled;
        private final boolean emailEnabled;
        private final boolean allTypesEnabled;

        public NotificationPreferences(boolean pushEnabled, boolean emailEnabled, boolean allTypesEnabled) {
            this.pushEnabled = pushEnabled;
            this.emailEnabled = emailEnabled;
            this.allTypesEnabled = allTypesEnabled;
        }

        public boolean isPushEnabled() {
            return pushEnabled;
        }

        public boolean isEmailEnabled() {
            return emailEnabled;
        }

        public boolean isTypeEnabled(String type) {
            return allTypesEnabled;
        }
    }
}