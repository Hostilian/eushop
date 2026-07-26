package com.eushop.core.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "order_lines")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarketplaceOrderLine {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "seller_order_id", nullable = false, length = 64)
    private String sellerOrderId;

    @Column(name = "offer_id", length = 64)
    private String offerId;

    @Column(name = "producer_product_id", length = 64)
    private String producerProductId;

    @Column(name = "food_id", length = 64)
    private String foodId;

    @Column(name = "product_name")
    private String productName;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "unit_price_cents", nullable = false)
    private long unitPriceCents;

    @Column(name = "total_cents", nullable = false)
    private long totalCents;

    @Column(nullable = false, length = 3)
    private String currency = "EUR";

    @Column(name = "lot_code")
    private String lotCode;

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
    }
}
