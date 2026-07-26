package com.eushop.core.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class PaymentServiceMarketplaceTest {

    private final PaymentService paymentService = new PaymentService();

    @Test
    void mockIntentIsDeterministicForMarketplaceAndIdempotencyKey() throws Exception {
        MarketplacePaymentIntent first = paymentService.createMarketplacePaymentIntent(
                2_500L,
                "EUR",
                "marketplace-1",
                "checkout-key-1");
        MarketplacePaymentIntent retry = paymentService.createMarketplacePaymentIntent(
                2_500L,
                "EUR",
                "marketplace-1",
                "checkout-key-1");

        assertEquals(first, retry);
        assertEquals(first.id() + "_secret_mock", first.clientSecret());
    }

    @Test
    void rejectsClientCurrencyOutsideCurrentEurWedge() {
        assertThrows(IllegalArgumentException.class, () ->
                paymentService.createMarketplacePaymentIntent(
                        2_500L,
                        "USD",
                        "marketplace-1",
                        "checkout-key-1"));
    }
}
