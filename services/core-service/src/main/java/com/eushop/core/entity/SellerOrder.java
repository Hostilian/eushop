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
@Table(name = "seller_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SellerOrder {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "marketplace_order_id", nullable = false, length = 64)
    private String marketplaceOrderId;

    @Column(name = "seller_id", nullable = false, length = 64)
    private String sellerId;

    @Column(name = "subtotal_cents", nullable = false)
    private long subtotalCents;

    @Column(name = "shipping_fee_cents", nullable = false)
    private long shippingFeeCents;

    @Column(name = "vat_cents", nullable = false)
    private long vatCents;

    @Column(name = "total_cents", nullable = false)
    private long totalCents;

    @Column(name = "platform_fee_cents", nullable = false)
    private long platformFeeCents;

    @Column(name = "seller_payout_cents", nullable = false)
    private long sellerPayoutCents;

    @Column(name = "refunded_amount_cents", nullable = false)
    private long refundedAmountCents;

    @Column(nullable = false, length = 3)
    private String currency = "EUR";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 64)
    private SellerOrderStatus status = SellerOrderStatus.PENDING;

    @Column(name = "stripe_transfer_id")
    private String stripeTransferId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
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
            status = SellerOrderStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now(ZoneOffset.UTC);
    }

    public enum SellerOrderStatus {
        PENDING,
        PAID,
        PROCESSING,
        SHIPPED,
        DELIVERED,
        CANCELLED,
        PARTIALLY_REFUNDED,
        REFUNDED
    }
}
