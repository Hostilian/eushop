package com.eushop.core.service;

import com.eushop.core.dto.MarketplaceCheckoutLineRequest;
import com.eushop.core.dto.MarketplaceCheckoutRequest;
import com.eushop.core.dto.MarketplaceCheckoutResponse;
import com.eushop.core.entity.MarketplaceOrder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class MarketplaceCheckoutOrchestratorTest {

    @Mock
    private MarketplaceCheckoutService checkoutService;
    @Mock
    private PaymentService paymentService;

    private MarketplaceCheckoutOrchestrator orchestrator;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        orchestrator = new MarketplaceCheckoutOrchestrator(checkoutService, paymentService);
    }

    @Test
    void createsStripeIntentOnlyAfterAggregatePreparation() throws Exception {
        MarketplaceOrder preparedOrder = order("marketplace-1", null);
        MarketplaceOrder attachedOrder = order("marketplace-1", "pi-1");
        var prepared = new MarketplaceCheckoutService.PreparedMarketplaceCheckout(
                preparedOrder,
                List.of());
        var attached = new MarketplaceCheckoutService.PreparedMarketplaceCheckout(
                attachedOrder,
                List.of());
        MarketplaceCheckoutResponse expected = response("marketplace-1", "pi-1");

        when(checkoutService.prepareCheckout("buyer-1", "key-1", request()))
                .thenReturn(prepared);
        when(paymentService.createMarketplacePaymentIntent(
                1_699L,
                "EUR",
                "marketplace-1",
                "key-1"))
                .thenReturn(new MarketplacePaymentIntent("pi-1", "secret-1"));
        when(checkoutService.attachPaymentIntent("marketplace-1", "pi-1"))
                .thenReturn(attached);
        when(checkoutService.toResponse(attached, "secret-1")).thenReturn(expected);

        MarketplaceCheckoutResponse actual = orchestrator.createPaymentIntent(
                "buyer-1",
                "key-1",
                request());

        assertEquals(expected, actual);
        verify(checkoutService).prepareCheckout("buyer-1", "key-1", request());
        verify(paymentService).createMarketplacePaymentIntent(
                1_699L,
                "EUR",
                "marketplace-1",
                "key-1");
        verify(checkoutService).attachPaymentIntent("marketplace-1", "pi-1");
    }

    @Test
    void idempotentRetryRetrievesExistingIntentWithoutCreatingAnother() throws Exception {
        MarketplaceOrder existingOrder = order("marketplace-1", "pi-existing");
        var prepared = new MarketplaceCheckoutService.PreparedMarketplaceCheckout(
                existingOrder,
                List.of());
        MarketplaceCheckoutResponse expected = response("marketplace-1", "pi-existing");

        when(checkoutService.prepareCheckout("buyer-1", "key-1", request()))
                .thenReturn(prepared);
        when(paymentService.retrieveMarketplacePaymentIntent("pi-existing"))
                .thenReturn(new MarketplacePaymentIntent("pi-existing", "secret-existing"));
        when(checkoutService.toResponse(prepared, "secret-existing")).thenReturn(expected);

        MarketplaceCheckoutResponse actual = orchestrator.createPaymentIntent(
                "buyer-1",
                "key-1",
                request());

        assertEquals(expected, actual);
        verify(paymentService, never()).createMarketplacePaymentIntent(
                1_699L,
                "EUR",
                "marketplace-1",
                "key-1");
    }

    private static MarketplaceOrder order(String id, String paymentIntentId) {
        MarketplaceOrder order = new MarketplaceOrder();
        order.setId(id);
        order.setBuyerId("buyer-1");
        order.setCurrency("EUR");
        order.setGrandTotalCents(1_699L);
        order.setStripePaymentIntentId(paymentIntentId);
        return order;
    }

    private static MarketplaceCheckoutRequest request() {
        return new MarketplaceCheckoutRequest(
                List.of(new MarketplaceCheckoutLineRequest("food-1", 1)),
                "DE",
                "Main Street 1, 10115 Berlin, DE");
    }

    private static MarketplaceCheckoutResponse response(
            String marketplaceOrderId,
            String paymentIntentId) {
        return new MarketplaceCheckoutResponse(
                marketplaceOrderId,
                paymentIntentId,
                "client-secret",
                "PAYMENT_REQUIRES_ACTION",
                "EUR",
                500L,
                999L,
                200L,
                1_699L,
                List.of());
    }
}
