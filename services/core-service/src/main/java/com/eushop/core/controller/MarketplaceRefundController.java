package com.eushop.core.controller;

import com.eushop.core.dto.ApiResponse;
import com.eushop.core.dto.MarketplaceRefundRequest;
import com.eushop.core.dto.MarketplaceRefundResponse;
import com.eushop.core.service.MarketplaceRefundOrchestrator;
import com.stripe.exception.StripeException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/marketplace-refunds")
public class MarketplaceRefundController {

    private final MarketplaceRefundOrchestrator orchestrator;

    public MarketplaceRefundController(MarketplaceRefundOrchestrator orchestrator) {
        this.orchestrator = orchestrator;
    }

    @PostMapping("/seller-orders/{sellerOrderId}")
    public ResponseEntity<ApiResponse<MarketplaceRefundResponse>> requestRefund(
            @RequestHeader("X-User-Id") String actorId,
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @PathVariable String sellerOrderId,
            @Valid @RequestBody MarketplaceRefundRequest request) {
        try {
            MarketplaceRefundResponse response = orchestrator.requestRefund(
                    actorId,
                    idempotencyKey,
                    sellerOrderId,
                    request);
            return ResponseEntity.status(HttpStatus.ACCEPTED)
                    .body(ApiResponse.success(
                            response,
                            "Refund submitted for provider confirmation"));
        } catch (SecurityException exception) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(exception.getMessage()));
        } catch (IllegalArgumentException | IllegalStateException exception) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(exception.getMessage()));
        } catch (StripeException exception) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(ApiResponse.error(
                            "Payment provider could not submit the refund"));
        }
    }
}
