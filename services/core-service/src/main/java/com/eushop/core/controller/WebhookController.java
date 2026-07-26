package com.eushop.core.controller;

import com.eushop.core.entity.Order;
import com.eushop.core.service.MarketplaceCheckoutService;
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
import org.springframework.transaction.annotation.Transactional;
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
    private final MarketplaceCheckoutService marketplaceCheckoutService;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Value("${stripe.webhook.secret:whsec_placeholder}")
    private String webhookSecret;

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    public WebhookController(
            OrderService orderService,
            MarketplaceCheckoutService marketplaceCheckoutService,
            org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        this.orderService = orderService;
        this.marketplaceCheckoutService = marketplaceCheckoutService;
        this.jdbcTemplate = jdbcTemplate;
    }

    @jakarta.annotation.PostConstruct
    public void validateConfig() {
        boolean isProduction = !"dev".equalsIgnoreCase(activeProfile) && !"test".equalsIgnoreCase(activeProfile);
        if (isProduction && (webhookSecret == null || webhookSecret.startsWith("whsec_placeholder") || webhookSecret.trim().isEmpty())) {
            throw new IllegalStateException("FATAL: Stripe webhook secret is not configured in production mode. Failing closed.");
        }
    }

    /**
     * Receives and processes Stripe webhook events.
     * The raw request body must be used as-is for signature verification.
     */
    @PostMapping("/stripe")
    @Transactional
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
                event = constructEvent(payload, sigHeader, webhookSecret);
            }
        } catch (SignatureVerificationException e) {
            log.error("Stripe webhook signature verification failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        } catch (Exception e) {
            log.error("Failed to parse Stripe webhook payload: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid payload");
        }

        log.info("Received Stripe event: type={} id={}", event.getType(), event.getId());

        // Deduplicate events to ensure processing idempotency
        String eventId = event.getId();
        if (eventId != null) {
            try {
                jdbcTemplate.update("INSERT INTO processed_webhook_events (event_id) VALUES (?)", eventId);
            } catch (org.springframework.dao.DuplicateKeyException e) {
                log.info("Duplicate Stripe webhook event detected and skipped: id={}", eventId);
                return ResponseEntity.ok("Received (Duplicate)");
            } catch (Exception e) {
                log.error("Failed to record processed webhook event: {}", e.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Database error");
            }
        }

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
        PaymentIntent paymentIntent = requirePaymentIntent(event);
        String paymentIntentId = paymentIntent.getId();
        log.info("Payment succeeded for PaymentIntent: {}", paymentIntentId);

        boolean marketplaceUpdated =
                marketplaceCheckoutService.markPaymentSucceeded(paymentIntentId);
        Optional<Order> orderOpt = orderService.getOrderByPaymentIntentId(paymentIntentId);
        if (orderOpt.isPresent()) {
            orderService.updateOrderStatus(orderOpt.get().getId(), Order.OrderStatus.CONFIRMED);
            log.info("Legacy order {} confirmed via webhook for PaymentIntent {}",
                    orderOpt.get().getId(), paymentIntentId);
        }
        if (!marketplaceUpdated && orderOpt.isEmpty()) {
            throw new IllegalStateException(
                    "No order found for succeeded PaymentIntent " + paymentIntentId);
        }
    }

    private void handlePaymentIntentFailed(Event event) {
        PaymentIntent paymentIntent = requirePaymentIntent(event);
        String paymentIntentId = paymentIntent.getId();
        log.warn("Payment FAILED for PaymentIntent: {}", paymentIntentId);

        boolean marketplaceUpdated =
                marketplaceCheckoutService.markPaymentFailed(paymentIntentId);
        Optional<Order> orderOpt = orderService.getOrderByPaymentIntentId(paymentIntentId);
        orderOpt.ifPresent(order -> {
            orderService.updateOrderStatus(order.getId(), Order.OrderStatus.CANCELLED);
            log.info("Legacy order {} cancelled for PaymentIntent {}",
                    order.getId(), paymentIntentId);
        });
        if (!marketplaceUpdated && orderOpt.isEmpty()) {
            throw new IllegalStateException(
                    "No order found for failed PaymentIntent " + paymentIntentId);
        }
    }

    private PaymentIntent requirePaymentIntent(Event event) {
        var object = event.getDataObjectDeserializer().getObject()
                .orElseThrow(() -> new IllegalStateException(
                        "Could not deserialize PaymentIntent from event " + event.getId()));
        if (!(object instanceof PaymentIntent paymentIntent)) {
            throw new IllegalStateException(
                    "Stripe event did not contain a PaymentIntent: " + event.getId());
        }
        return paymentIntent;
    }

    Event constructEvent(String payload, String sigHeader, String secret) throws SignatureVerificationException {
        return Webhook.constructEvent(payload, sigHeader, secret);
    }
}
