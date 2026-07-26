package com.eushop.core.service;

import com.eushop.core.dto.MarketplaceCheckoutRequest;
import com.eushop.core.dto.MarketplaceCheckoutResponse;
import com.stripe.exception.StripeException;
import org.springframework.stereotype.Service;

/**
 * Coordinates the local transaction and the external Stripe call without
 * pretending they share one database transaction.
 */
@Service
public class MarketplaceCheckoutOrchestrator {

    private final MarketplaceCheckoutService checkoutService;
    private final PaymentService paymentService;

    public MarketplaceCheckoutOrchestrator(
            MarketplaceCheckoutService checkoutService,
            PaymentService paymentService) {
        this.checkoutService = checkoutService;
        this.paymentService = paymentService;
    }

    public MarketplaceCheckoutResponse createPaymentIntent(
            String buyerId,
            String idempotencyKey,
            MarketplaceCheckoutRequest request) throws StripeException {
        MarketplaceCheckoutService.PreparedMarketplaceCheckout prepared =
                checkoutService.prepareCheckout(buyerId, idempotencyKey, request);

        MarketplacePaymentIntent paymentIntent;
        if (prepared.marketplaceOrder().getStripePaymentIntentId() == null) {
            paymentIntent = paymentService.createMarketplacePaymentIntent(
                    prepared.marketplaceOrder().getGrandTotalCents(),
                    prepared.marketplaceOrder().getCurrency(),
                    prepared.marketplaceOrder().getId(),
                    idempotencyKey);
            prepared = checkoutService.attachPaymentIntent(
                    prepared.marketplaceOrder().getId(),
                    paymentIntent.id());
        } else {
            paymentIntent = paymentService.retrieveMarketplacePaymentIntent(
                    prepared.marketplaceOrder().getStripePaymentIntentId());
        }

        return checkoutService.toResponse(prepared, paymentIntent.clientSecret());
    }
}
