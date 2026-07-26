package com.eushop.core.dto;

import java.util.List;

public record MarketplaceCheckoutResponse(
        String marketplaceOrderId,
        String paymentIntentId,
        String clientSecret,
        String status,
        String currency,
        long grandSubtotalCents,
        long grandShippingCents,
        long grandVatCents,
        long grandTotalCents,
        List<SellerOrderSummary> sellerOrders) {

    public record SellerOrderSummary(
            String sellerOrderId,
            String sellerId,
            long subtotalCents,
            long shippingFeeCents,
            long vatCents,
            long totalCents,
            long platformFeeCents,
            long sellerPayoutCents,
            String status) {
    }
}
