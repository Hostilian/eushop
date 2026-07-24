package com.eushop.core.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "marketplace_ledger_entries")
public class MarketplaceLedgerEntry {

    @Id
    private String id;

    @Column(name = "marketplace_order_id", nullable = false)
    private String marketplaceOrderId;

    @Column(name = "seller_order_id")
    private String sellerOrderId;

    @Column(name = "seller_id", nullable = false)
    private String sellerId;

    @Column(name = "buyer_id", nullable = false)
    private String buyerId;

    @Column(name = "entry_type", nullable = false)
    private String entryType; // e.g. BUYER_CHARGE, SELLER_CREDIT, PLATFORM_FEE, VAT_LIABILITY, SHIPPING_FEE, REFUND

    @Column(name = "gross_amount_cents", nullable = false)
    private long grossAmountCents;

    @Column(name = "net_amount_cents", nullable = false)
    private long netAmountCents;

    @Column(name = "vat_amount_cents", nullable = false)
    private long vatAmountCents;

    @Column(name = "platform_fee_cents", nullable = false)
    private long platformFeeCents;

    @Column(name = "currency", nullable = false, length = 3)
    private String currency = "EUR";

    @Column(name = "stripe_payment_intent_id")
    private String stripePaymentIntentId;

    @Column(name = "idempotency_key", nullable = false, unique = true)
    private String idempotencyKey;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public MarketplaceLedgerEntry() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMarketplaceOrderId() {
        return marketplaceOrderId;
    }

    public void setMarketplaceOrderId(String marketplaceOrderId) {
        this.marketplaceOrderId = marketplaceOrderId;
    }

    public String getSellerOrderId() {
        return sellerOrderId;
    }

    public void setSellerOrderId(String sellerOrderId) {
        this.sellerOrderId = sellerOrderId;
    }

    public String getSellerId() {
        return sellerId;
    }

    public void setSellerId(String sellerId) {
        this.sellerId = sellerId;
    }

    public String getBuyerId() {
        return buyerId;
    }

    public void setBuyerId(String buyerId) {
        this.buyerId = buyerId;
    }

    public String getEntryType() {
        return entryType;
    }

    public void setEntryType(String entryType) {
        this.entryType = entryType;
    }

    public long getGrossAmountCents() {
        return grossAmountCents;
    }

    public void setGrossAmountCents(long grossAmountCents) {
        this.grossAmountCents = grossAmountCents;
    }

    public long getNetAmountCents() {
        return netAmountCents;
    }

    public void setNetAmountCents(long netAmountCents) {
        this.netAmountCents = netAmountCents;
    }

    public long getVatAmountCents() {
        return vatAmountCents;
    }

    public void setVatAmountCents(long vatAmountCents) {
        this.vatAmountCents = vatAmountCents;
    }

    public long getPlatformFeeCents() {
        return platformFeeCents;
    }

    public void setPlatformFeeCents(long platformFeeCents) {
        this.platformFeeCents = platformFeeCents;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getStripePaymentIntentId() {
        return stripePaymentIntentId;
    }

    public void setStripePaymentIntentId(String stripePaymentIntentId) {
        this.stripePaymentIntentId = stripePaymentIntentId;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
