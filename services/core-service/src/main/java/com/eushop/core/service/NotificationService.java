package com.eushop.core.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eushop.core.entity.Notification;
import com.eushop.core.repository.NotificationRepository;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public Notification createNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    public Optional<Notification> getNotificationById(String id) {
        return notificationRepository.findById(id);
    }

    public List<Notification> getNotificationsByUser(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotifications(String userId) {
        return notificationRepository.getUnreadNotifications(userId);
    }

    public Long getUnreadCount(String userId) {
        return notificationRepository.getUnreadCount(userId);
    }

    public void markAsRead(String notificationId) {
        Optional<Notification> notification = notificationRepository.findById(notificationId);
        if (notification.isPresent()) {
            Notification notif = notification.get();
            notif.setIsRead(true);
            notif.setReadAt(LocalDateTime.now());
            notificationRepository.save(notif);
        }
    }

    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.getUnreadNotifications(userId);
        unread.forEach(notif -> {
            notif.setIsRead(true);
            notif.setReadAt(LocalDateTime.now());
        });
        notificationRepository.saveAll(unread);
    }

    public void deleteNotification(String id) {
        notificationRepository.deleteById(id);
    }
}
