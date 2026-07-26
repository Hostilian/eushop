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
@Table(name = "marketplace_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarketplaceOrder {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "buyer_id", nullable = false, length = 64)
    private String buyerId;

    @Column(name = "grand_subtotal_cents")
    private Long grandSubtotalCents;

    @Column(name = "grand_shipping_cents")
    private Long grandShippingCents;

    @Column(name = "grand_vat_cents")
    private Long grandVatCents;

    @Column(name = "grand_total_cents", nullable = false)
    private Long grandTotalCents;

    @Column(nullable = false, length = 3)
    private String currency = "EUR";

    @Column(name = "stripe_payment_intent_id", unique = true)
    private String stripePaymentIntentId;

    @Column(name = "idempotency_key", length = 128)
    private String idempotencyKey;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private MarketplaceOrderStatus status = MarketplaceOrderStatus.PAYMENT_PENDING;

    @Column(name = "destination_country_iso2", length = 2)
    private String destinationCountryIso2;

    @Column(name = "shipping_address")
    private String shippingAddress;

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
            status = MarketplaceOrderStatus.PAYMENT_PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now(ZoneOffset.UTC);
    }

    public enum MarketplaceOrderStatus {
        PAYMENT_PENDING,
        PAYMENT_REQUIRES_ACTION,
        PAID,
        PAYMENT_FAILED,
        PARTIALLY_REFUNDED,
        REFUNDED,
        CANCELLED
    }
}
