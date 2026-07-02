package com.eushop.core.controller;

import com.eushop.core.dto.ApiResponse;
import com.eushop.core.service.PaymentService;
import com.stripe.exception.StripeException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/connect/account")
    public ResponseEntity<ApiResponse<Map<String, String>>> createConnectAccount(
            @RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String country = request.get("country");
            Map<String, String> account = paymentService.createConnectAccount(email, country);
            return ResponseEntity.ok(ApiResponse.success(account, "Stripe Connect account created"));
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to create Stripe account: " + e.getMessage()));
        }
    }

    @PostMapping("/connect/link")
    public ResponseEntity<ApiResponse<Map<String, String>>> createAccountLink(
            @RequestBody Map<String, String> request) {
        try {
            String accountId = request.get("accountId");
            String returnUrl = request.get("returnUrl");
            String refreshUrl = request.get("refreshUrl");
            Map<String, String> link = paymentService.createAccountLink(accountId, returnUrl, refreshUrl);
            return ResponseEntity.ok(ApiResponse.success(link, "Stripe Account Link created"));
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to create Stripe account link: " + e.getMessage()));
        }
    }

    @PostMapping("/create-payment-intent")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createPaymentIntent(
            @RequestBody Map<String, Object> request) {
        try {
            Double amount = Double.valueOf(request.get("amount").toString());
            String currency = request.getOrDefault("currency", "eur").toString();
            String sellerAccountId = (String) request.get("sellerAccountId");
            Map<String, Object> intent = paymentService.createPaymentIntent(amount, currency, sellerAccountId);
            return ResponseEntity.ok(ApiResponse.success(intent, "Payment Intent created successfully"));
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to create Payment Intent: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid arguments: " + e.getMessage()));
        }
    }
}
