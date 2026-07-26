package com.eushop.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Entity
@Table(name = "marketplace_refunds")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarketplaceRefund {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "marketplace_order_id", nullable = false, length = 64)
    private String marketplaceOrderId;

    @Column(name = "seller_order_id", nullable = false, length = 64)
    private String sellerOrderId;

    @Column(name = "actor_id", nullable = false, length = 64)
    private String actorId;

    @Column(name = "amount_cents", nullable = false)
    private long amountCents;

    @Column(nullable = false, length = 3)
    private String currency = "EUR";

    @Column(length = 500)
    private String reason;

    @Column(name = "idempotency_key", nullable = false, unique = true, length = 128)
    private String idempotencyKey;

    @Column(name = "stripe_refund_id", unique = true)
    private String stripeRefundId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private MarketplaceRefundStatus status = MarketplaceRefundStatus.REQUESTED;

    @Column(name = "failure_reason", length = 500)
    private String failureReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        createdAt = now;
        updatedAt = now;
        if (status == null) {
            status = MarketplaceRefundStatus.REQUESTED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now(ZoneOffset.UTC);
    }

    public enum MarketplaceRefundStatus {
        REQUESTED,
        SUBMITTED,
        SUCCEEDED,
        FAILED
    }
}
