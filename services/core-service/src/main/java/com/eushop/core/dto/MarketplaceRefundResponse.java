package com.eushop.core.dto;

public record MarketplaceRefundResponse(
        String refundId,
        String marketplaceOrderId,
        String sellerOrderId,
        long amountCents,
        String currency,
        String status,
        String stripeRefundId) {
}
