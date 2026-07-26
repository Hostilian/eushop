package com.eushop.core.service;

import com.eushop.core.dto.MarketplaceRefundRequest;
import com.eushop.core.dto.MarketplaceRefundResponse;
import com.eushop.core.entity.MarketplaceRefund;
import com.stripe.exception.StripeException;
import org.springframework.stereotype.Service;

@Service
public class MarketplaceRefundOrchestrator {

    private final MarketplaceRefundService refundService;
    private final PaymentService paymentService;

    public MarketplaceRefundOrchestrator(
            MarketplaceRefundService refundService,
            PaymentService paymentService) {
        this.refundService = refundService;
        this.paymentService = paymentService;
    }

    public MarketplaceRefundResponse requestRefund(
            String actorId,
            String idempotencyKey,
            String sellerOrderId,
            MarketplaceRefundRequest request) throws StripeException {
        var prepared = refundService.prepareRefund(
                actorId,
                idempotencyKey,
                sellerOrderId,
                request);
        MarketplaceRefund refund = prepared.refund();
        if (refund.getStripeRefundId() != null) {
            return refundService.toResponse(refund);
        }

        MarketplaceRefundResult providerRefund =
                paymentService.createMarketplaceRefund(
                        prepared.marketplaceOrder().getStripePaymentIntentId(),
                        refund.getAmountCents(),
                        refund.getId(),
                        idempotencyKey);
        MarketplaceRefund attached = refundService.attachProviderRefund(
                refund.getId(),
                providerRefund);
        return refundService.toResponse(attached);
    }
}
