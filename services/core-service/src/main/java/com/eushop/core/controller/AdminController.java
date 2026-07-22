package com.eushop.core.controller;

import com.eushop.core.entity.Food;
import com.eushop.core.entity.Order;
import com.eushop.core.entity.User;
import com.eushop.core.service.ModerationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * AdminController exposes REST endpoints for seller onboarding approval,
 * listing moderation, dispute resolution, and regulatory audit trail.
 */
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private ModerationService moderationService;

    @PostMapping("/sellers/{id}/approve")
    public ResponseEntity<User> approveSeller(
            @PathVariable String id,
            @RequestParam(defaultValue = "admin-system") String adminId) {
        User updated = moderationService.approveSeller(id, adminId);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/sellers/{id}/reject")
    public ResponseEntity<User> rejectSeller(
            @PathVariable String id,
            @RequestParam(defaultValue = "Policy non-compliance") String reason,
            @RequestParam(defaultValue = "admin-system") String adminId) {
        User updated = moderationService.rejectSeller(id, reason, adminId);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/listings/{id}/moderate")
    public ResponseEntity<Food> moderateListing(
            @PathVariable String id,
            @RequestParam boolean approved,
            @RequestParam(defaultValue = "Approved listing") String reason,
            @RequestParam(defaultValue = "admin-system") String adminId) {
        Food food = moderationService.moderateListing(id, approved, reason, adminId);
        return ResponseEntity.ok(food);
    }

    @PostMapping("/disputes/{id}/resolve")
    public ResponseEntity<Order> resolveDispute(
            @PathVariable String id,
            @RequestParam(defaultValue = "REFUND") String resolution,
            @RequestParam(defaultValue = "admin-system") String adminId) {
        Order order = moderationService.resolveDispute(id, resolution, adminId);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<Map<String, Object>>> getAuditLogs() {
        return ResponseEntity.ok(moderationService.getAuditLogs());
    }
}
