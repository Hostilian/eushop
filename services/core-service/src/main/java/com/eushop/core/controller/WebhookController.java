package com.eushop.core.controller;

import com.eushop.core.entity.Order;
import com.eushop.core.service.OrderService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * Handles incoming Stripe webhook events.
 *
 * <p>Stripe fires these server-to-server — they are NOT triggered by the browser redirect.
 * Payment confirmation MUST come through here, never from the frontend alone.
 *
 * <p>To configure locally: stripe listen --forward-to localhost:3001/api/webhooks/stripe
 * Set STRIPE_WEBHOOK_SECRET to the signing secret printed by the CLI.
 */
@RestController
@RequestMapping("/api/webhooks")
public class WebhookController {

    private static final Logger log = LoggerFactory.getLogger(WebhookController.class);

    private final OrderService orderService;

    @Value("${stripe.webhook.secret:whsec_placeholder}")
    private String webhookSecret;

    public WebhookController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * Receives and processes Stripe webhook events.
     * The raw request body must be used as-is for signature verification.
     */
    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        // Skip real verification in test/dev mode when no real secret is configured
        boolean isMockSecret = webhookSecret == null || webhookSecret.startsWith("whsec_placeholder");

        Event event;
        try {
            if (isMockSecret) {
                log.warn("STRIPE_WEBHOOK_SECRET not configured — skipping signature verification (dev mode only)");
                event = com.stripe.model.Event.GSON.fromJson(payload, Event.class);
            } else {
                event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            }
        } catch (SignatureVerificationException e) {
            log.error("Stripe webhook signature verification failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        } catch (Exception e) {
            log.error("Failed to parse Stripe webhook payload: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid payload");
        }

        log.info("Received Stripe event: type={} id={}", event.getType(), event.getId());

        switch (event.getType()) {
            case "payment_intent.succeeded" -> handlePaymentIntentSucceeded(event);
            case "payment_intent.payment_failed" -> handlePaymentIntentFailed(event);
            case "account.updated" -> log.info("Stripe Connect account updated: {}", event.getId());
            default -> log.debug("Unhandled Stripe event type: {}", event.getType());
        }

        // Always return 200 to Stripe to acknowledge receipt (even for unhandled events)
        return ResponseEntity.ok("Received");
    }

    /**
     * On payment success, find the order linked to this PaymentIntent and mark it CONFIRMED.
     * The PaymentIntent ID is stored on the order at creation time (see OrderController).
     */
    private void handlePaymentIntentSucceeded(Event event) {
        try {
            var dataObjectDeserializer = event.getDataObjectDeserializer();
            if (dataObjectDeserializer.getObject().isEmpty()) {
                log.warn("Could not deserialize PaymentIntent from event {}", event.getId());
                return;
            }
            PaymentIntent paymentIntent = (PaymentIntent) dataObjectDeserializer.getObject().get();
            String paymentIntentId = paymentIntent.getId();

            log.info("Payment succeeded for PaymentIntent: {}", paymentIntentId);

            // Find the order associated with this PaymentIntent and confirm it
            Optional<Order> orderOpt = orderService.getOrderByPaymentIntentId(paymentIntentId);
            if (orderOpt.isPresent()) {
                orderService.updateOrderStatus(orderOpt.get().getId(), Order.OrderStatus.CONFIRMED);
                log.info("Order {} confirmed via webhook for PaymentIntent {}", orderOpt.get().getId(), paymentIntentId);
            } else {
                log.warn("No order found for PaymentIntent {} — cannot update status", paymentIntentId);
            }
        } catch (Exception e) {
            log.error("Error processing payment_intent.succeeded: {}", e.getMessage(), e);
        }
    }

    private void handlePaymentIntentFailed(Event event) {
        try {
            var dataObjectDeserializer = event.getDataObjectDeserializer();
            if (dataObjectDeserializer.getObject().isEmpty()) return;
            PaymentIntent paymentIntent = (PaymentIntent) dataObjectDeserializer.getObject().get();
            String paymentIntentId = paymentIntent.getId();

            log.warn("Payment FAILED for PaymentIntent: {}", paymentIntentId);

            Optional<Order> orderOpt = orderService.getOrderByPaymentIntentId(paymentIntentId);
            orderOpt.ifPresent(order -> {
                orderService.updateOrderStatus(order.getId(), Order.OrderStatus.CANCELLED);
                log.info("Order {} cancelled due to payment failure for PaymentIntent {}", order.getId(), paymentIntentId);
            });
        } catch (Exception e) {
            log.error("Error processing payment_intent.payment_failed: {}", e.getMessage(), e);
        }
    }
}
