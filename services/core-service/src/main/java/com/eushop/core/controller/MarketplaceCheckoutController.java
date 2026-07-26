package com.eushop.core.controller;

import com.eushop.core.dto.ApiResponse;
import com.eushop.core.dto.MarketplaceCheckoutRequest;
import com.eushop.core.dto.MarketplaceCheckoutResponse;
import com.eushop.core.service.MarketplaceCheckoutOrchestrator;
import com.stripe.exception.StripeException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/marketplace-checkout")
public class MarketplaceCheckoutController {

    private final MarketplaceCheckoutOrchestrator orchestrator;

    public MarketplaceCheckoutController(MarketplaceCheckoutOrchestrator orchestrator) {
        this.orchestrator = orchestrator;
    }

    @PostMapping("/payment-intent")
    public ResponseEntity<ApiResponse<MarketplaceCheckoutResponse>> createPaymentIntent(
            @RequestHeader("X-User-Id") String buyerId,
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @Valid @RequestBody MarketplaceCheckoutRequest request) {
        try {
            MarketplaceCheckoutResponse response = orchestrator.createPaymentIntent(
                    buyerId,
                    idempotencyKey,
                    request);
            return ResponseEntity.ok(ApiResponse.success(
                    response,
                    "Marketplace payment intent prepared"));
        } catch (SecurityException exception) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(exception.getMessage()));
        } catch (IllegalArgumentException | IllegalStateException exception) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(exception.getMessage()));
        } catch (StripeException exception) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(ApiResponse.error("Payment provider could not prepare checkout"));
        }
    }
}
