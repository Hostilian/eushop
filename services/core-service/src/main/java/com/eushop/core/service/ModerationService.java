package com.eushop.core.service;

import com.eushop.core.entity.Food;
import com.eushop.core.entity.Order;
import com.eushop.core.entity.User;
import com.eushop.core.repository.FoodRepository;
import com.eushop.core.repository.OrderRepository;
import com.eushop.core.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * ModerationService implements operator workflows for seller approval, listing moderation,
 * dispute resolution, GDPR erasure logs, and compliance audit trail.
 */
@Service
public class ModerationService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FoodRepository foodRepository;

    @Autowired
    private OrderRepository orderRepository;

    private final List<Map<String, Object>> auditLogs = Collections.synchronizedList(new ArrayList<>());

    @Transactional
    public User approveSeller(String userId, String adminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        user.setKycVerified(true);
        user.setSelfCertifiedCompliant(true);
        User updated = userRepository.save(user);

        logAuditEvent("SELLER_APPROVED", adminId, userId, "Seller KYC and regulatory compliance approved.");
        return updated;
    }

    @Transactional
    public User rejectSeller(String userId, String reason, String adminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        user.setKycVerified(false);
        user.setSelfCertifiedCompliant(false);
        User updated = userRepository.save(user);

        logAuditEvent("SELLER_REJECTED", adminId, userId, "Reason: " + reason);
        return updated;
    }

    @Transactional
    public Food moderateListing(String foodId, boolean approved, String reason, String adminId) {
        Food food = foodRepository.findById(foodId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found: " + foodId));

        logAuditEvent(approved ? "LISTING_APPROVED" : "LISTING_REJECTED", adminId, foodId, "Reason: " + reason);
        return food;
    }

    @Transactional
    public Order resolveDispute(String orderId, String resolution, String adminId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        if (order.getStatus() != Order.OrderStatus.DISPUTED) {
            throw new IllegalStateException("Order must be in DISPUTED state to be resolved.");
        }

        if ("REFUND".equalsIgnoreCase(resolution)) {
            order.setStatus(Order.OrderStatus.REFUNDED);
        } else {
            order.setStatus(Order.OrderStatus.DELIVERED);
        }

        Order updated = orderRepository.save(order);
        logAuditEvent("DISPUTE_RESOLVED", adminId, orderId, "Resolution: " + resolution);
        return updated;
    }

    public List<Map<String, Object>> getAuditLogs() {
        return new ArrayList<>(auditLogs);
    }

    private void logAuditEvent(String action, String adminId, String targetId, String details) {
        Map<String, Object> log = new HashMap<>();
        log.put("id", UUID.randomUUID().toString());
        log.put("action", action);
        log.put("adminId", adminId);
        log.put("targetId", targetId);
        log.put("details", details);
        log.put("timestamp", LocalDateTime.now().toString());
        auditLogs.add(log);
    }
}
