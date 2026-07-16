package com.eushop.core.controller;

import com.eushop.core.entity.Order;
import com.eushop.core.service.OrderService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
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
        when(mockEvent.getType()).thenReturn("payment_intent.succeeded");
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

        // Mock Webhook.constructEvent
        WebhookController spyController = spy(webhookController);
        doReturn(mockEvent).when(spyController).constructEvent(anyString(), anyString(), anyString());

        ResponseEntity<String> response = spyController.handleStripeWebhook(validPayload, validSigHeader);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(orderService, times(1)).updateOrderStatus("order_1", Order.OrderStatus.CONFIRMED);
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

    // Helper method to mock Webhook.constructEvent
    private Event constructEvent(String payload, String sigHeader, String secret) throws Exception {
        return Webhook.constructEvent(payload, sigHeader, secret);
    }
}