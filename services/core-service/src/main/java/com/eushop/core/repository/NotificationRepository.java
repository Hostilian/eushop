package com.eushop.core.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eushop.core.entity.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
    
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.isRead = false ORDER BY n.createdAt DESC")
    List<Notification> getUnreadNotifications(@Param("userId") String userId);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.id = :userId AND n.isRead = false")
    Long getUnreadCount(@Param("userId") String userId);
}
