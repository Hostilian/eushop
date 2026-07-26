package com.eushop.core.controller;

import com.eushop.core.entity.Order;
import com.eushop.core.service.MarketplaceCheckoutService;
import com.eushop.core.service.MarketplaceRefundService;
import com.eushop.core.service.OrderService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.net.Webhook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class WebhookControllerTest {

    @Mock
    private OrderService orderService;

    @Mock
    private MarketplaceCheckoutService marketplaceCheckoutService;

    @Mock
    private MarketplaceRefundService marketplaceRefundService;

    @Mock
    private JdbcTemplate jdbcTemplate;

    @InjectMocks
    private WebhookController webhookController;

    private final String validPayload = "{\"id\":\"evt_1\",\"type\":\"payment_intent.succeeded\",\"data\":{\"object\":{\"id\":\"pi_1\"}}}";
    private final String validSigHeader = "t=123,v1=abc";
    private final String webhookSecret = "whsec_test";

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        org.springframework.test.util.ReflectionTestUtils.setField(webhookController, "webhookSecret", webhookSecret);
        org.springframework.test.util.ReflectionTestUtils.setField(webhookController, "activeProfile", "test");
    }

    @Test
    void handleStripeWebhook_ValidSignature_ReturnsOk() throws Exception {
        // Mock Webhook.constructEvent to return a valid event
        Event mockEvent = mock(Event.class);
        when(mockEvent.getType()).thenReturn("account.updated");
        when(mockEvent.getId()).thenReturn("evt_1");

        // Mock static Webhook.constructEvent
        WebhookController spyController = spy(webhookController);
        doReturn(mockEvent).when(spyController).constructEvent(anyString(), anyString(), anyString());

        ResponseEntity<String> response = spyController.handleStripeWebhook(validPayload, validSigHeader);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Received", response.getBody());
    }

    @Test
    void handleStripeWebhook_InvalidSignature_ReturnsBadRequest() throws Exception {
        // Mock Webhook.constructEvent to throw SignatureVerificationException
        WebhookController spyController = spy(webhookController);
        doThrow(new SignatureVerificationException("Invalid signature", "sig"))
                .when(spyController).constructEvent(anyString(), anyString(), anyString());

        ResponseEntity<String> response = spyController.handleStripeWebhook(validPayload, "invalid-sig");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid signature", response.getBody());
    }

    @Test
    void handleStripeWebhook_PaymentIntentSucceeded_UpdatesOrderStatus() throws Exception {
        // Mock Event
        Event mockEvent = mock(Event.class);
        when(mockEvent.getType()).thenReturn("payment_intent.succeeded");
        when(mockEvent.getId()).thenReturn("evt_1");

        // Mock PaymentIntent
        PaymentIntent mockPaymentIntent = mock(PaymentIntent.class);
        when(mockPaymentIntent.getId()).thenReturn("pi_1");

        // Mock Event deserialization
        com.stripe.model.EventDataObjectDeserializer mockDeserializer = mock(com.stripe.model.EventDataObjectDeserializer.class);
        when(mockEvent.getDataObjectDeserializer()).thenReturn(mockDeserializer);
        Optional<com.stripe.model.StripeObject> stripeObjectOptional = Optional.of(mockPaymentIntent);
        when(mockDeserializer.getObject()).thenReturn(stripeObjectOptional);

        // Mock OrderService
        Order mockOrder = new Order();
        mockOrder.setId("order_1");
        when(orderService.getOrderByPaymentIntentId("pi_1")).thenReturn(Optional.of(mockOrder));
        when(marketplaceCheckoutService.markPaymentSucceeded("pi_1")).thenReturn(false);

        // Mock Webhook.constructEvent
        WebhookController spyController = spy(webhookController);
        doReturn(mockEvent).when(spyController).constructEvent(anyString(), anyString(), anyString());

        ResponseEntity<String> response = spyController.handleStripeWebhook(validPayload, validSigHeader);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(orderService, times(1)).updateOrderStatus("order_1", Order.OrderStatus.CONFIRMED);
    }

    @Test
    void handleStripeWebhook_MarketplacePaymentSucceeded_UpdatesAggregate() throws Exception {
        Event mockEvent = mock(Event.class);
        when(mockEvent.getType()).thenReturn("payment_intent.succeeded");
        when(mockEvent.getId()).thenReturn("evt_marketplace");

        PaymentIntent mockPaymentIntent = mock(PaymentIntent.class);
        when(mockPaymentIntent.getId()).thenReturn("pi_marketplace");
        com.stripe.model.EventDataObjectDeserializer mockDeserializer =
                mock(com.stripe.model.EventDataObjectDeserializer.class);
        when(mockEvent.getDataObjectDeserializer()).thenReturn(mockDeserializer);
        when(mockDeserializer.getObject()).thenReturn(Optional.of(mockPaymentIntent));
        when(marketplaceCheckoutService.markPaymentSucceeded("pi_marketplace"))
                .thenReturn(true);
        when(orderService.getOrderByPaymentIntentId("pi_marketplace"))
                .thenReturn(Optional.empty());

        WebhookController spyController = spy(webhookController);
        doReturn(mockEvent).when(spyController)
                .constructEvent(anyString(), anyString(), anyString());

        ResponseEntity<String> response =
                spyController.handleStripeWebhook(validPayload, validSigHeader);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(marketplaceCheckoutService).markPaymentSucceeded("pi_marketplace");
        verify(orderService, never()).updateOrderStatus(anyString(), any());
    }

    @Test
    void handleStripeWebhook_DuplicateEvent_ReturnsOk() throws Exception {
        // Mock Event
        Event mockEvent = mock(Event.class);
        when(mockEvent.getType()).thenReturn("payment_intent.succeeded");
        when(mockEvent.getId()).thenReturn("evt_1");

        // Mock JdbcTemplate to throw DuplicateKeyException
        doThrow(new org.springframework.dao.DuplicateKeyException("Duplicate event"))
                .when(jdbcTemplate).update(anyString(), anyString());

        // Mock Webhook.constructEvent
        WebhookController spyController = spy(webhookController);
        doReturn(mockEvent).when(spyController).constructEvent(anyString(), anyString(), anyString());

        ResponseEntity<String> response = spyController.handleStripeWebhook(validPayload, validSigHeader);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Received (Duplicate)", response.getBody());
    }

    @Test
    void handleStripeWebhook_RefundCreated_ReconcilesReservedRefund()
            throws Exception {
        Event mockEvent = mock(Event.class);
        when(mockEvent.getType()).thenReturn("refund.created");
        when(mockEvent.getId()).thenReturn("evt_refund");

        Refund mockRefund = mock(Refund.class);
        when(mockRefund.getId()).thenReturn("re_1");
        when(mockRefund.getPaymentIntent()).thenReturn("pi_marketplace");
        when(mockRefund.getAmount()).thenReturn(1_500L);
        when(mockRefund.getStatus()).thenReturn("succeeded");

        com.stripe.model.EventDataObjectDeserializer mockDeserializer =
                mock(com.stripe.model.EventDataObjectDeserializer.class);
        when(mockEvent.getDataObjectDeserializer()).thenReturn(mockDeserializer);
        when(mockDeserializer.getObject()).thenReturn(Optional.of(mockRefund));
        when(marketplaceRefundService.applyProviderRefund(
                "re_1",
                "pi_marketplace",
                1_500L,
                "succeeded",
                null)).thenReturn(true);

        WebhookController spyController = spy(webhookController);
        doReturn(mockEvent).when(spyController)
                .constructEvent(anyString(), anyString(), anyString());

        ResponseEntity<String> response =
                spyController.handleStripeWebhook(validPayload, validSigHeader);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(marketplaceRefundService).applyProviderRefund(
                "re_1",
                "pi_marketplace",
                1_500L,
                "succeeded",
                null);
    }

    // Helper method to mock Webhook.constructEvent
    private Event constructEvent(String payload, String sigHeader, String secret) throws Exception {
        return Webhook.constructEvent(payload, sigHeader, secret);
    }
}
