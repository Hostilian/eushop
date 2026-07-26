package com.eushop.core.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Account;
import com.stripe.model.AccountLink;
import com.stripe.model.PaymentIntent;
import com.stripe.param.AccountCreateParams;
import com.stripe.param.AccountLinkCreateParams;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class PaymentService {

    @Value("${stripe.secret.key:sk_test_placeholder}")
    private String stripeSecretKey;

    @PostConstruct
    public void init() {
        if (stripeSecretKey != null && !stripeSecretKey.startsWith("sk_test_placeholder") && !stripeSecretKey.equals("sk_test_...")) {
            Stripe.apiKey = stripeSecretKey;
        } else {
            // Setup a default dummy test key so Stripe compile runs
            Stripe.apiKey = "sk_test_51MockKeyForCompilationAndDevelopmentOnlyPurposes";
        }
    }

    private boolean isMock() {
        return stripeSecretKey == null || stripeSecretKey.startsWith("sk_test_placeholder") || stripeSecretKey.equals("sk_test_...");
    }

    public Map<String, String> createConnectAccount(String email, String country) throws StripeException {
        if (isMock()) {
            Map<String, String> mockResponse = new HashMap<>();
            mockResponse.put("accountId", "acct_mock_12345");
            return mockResponse;
        }

        AccountCreateParams params = AccountCreateParams.builder()
                .setType(AccountCreateParams.Type.EXPRESS)
                .setCountry(country != null ? country : "BE")
                .setEmail(email)
                .setCapabilities(
                        AccountCreateParams.Capabilities.builder()
                                .setCardPayments(AccountCreateParams.Capabilities.CardPayments.builder().setRequested(true).build())
                                .setTransfers(AccountCreateParams.Capabilities.Transfers.builder().setRequested(true).build())
                                .build()
                )
                .build();

        Account account = Account.create(params);
        Map<String, String> response = new HashMap<>();
        response.put("accountId", account.getId());
        return response;
    }

    public Map<String, String> createAccountLink(String accountId, String returnUrl, String refreshUrl) throws StripeException {
        if (isMock()) {
            Map<String, String> mockResponse = new HashMap<>();
            mockResponse.put("url", "https://connect.stripe.com/express/onboarding/mock");
            return mockResponse;
        }

        AccountLinkCreateParams params = AccountLinkCreateParams.builder()
                .setAccount(accountId)
                .setReturnUrl(returnUrl)
                .setRefreshUrl(refreshUrl)
                .setType(AccountLinkCreateParams.Type.ACCOUNT_ONBOARDING)
                .build();

        AccountLink accountLink = AccountLink.create(params);
        Map<String, String> response = new HashMap<>();
        response.put("url", accountLink.getUrl());
        return response;
    }

    public Map<String, Object> createPaymentIntent(Double amount, String currency, String sellerAccountId, String idempotencyKey) throws StripeException {
        long amountInCents = Math.round(amount * 100);

        if (isMock()) {
            Map<String, Object> mockResponse = new HashMap<>();
            mockResponse.put("clientSecret", "pi_mock_secret_12345_client_secret_67890");
            mockResponse.put("id", "pi_mock_12345");
            return mockResponse;
        }

        PaymentIntentCreateParams.Builder builder = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency(currency != null ? currency.toLowerCase() : "eur");

        if (sellerAccountId != null && !sellerAccountId.isEmpty() && !sellerAccountId.startsWith("acct_mock")) {
            long applicationFeeAmount = Math.round(amountInCents * 0.15); // 15% platform take-rate
            builder.setTransferData(
                    PaymentIntentCreateParams.TransferData.builder()
                            .setDestination(sellerAccountId)
                            .build()
            ).setApplicationFeeAmount(applicationFeeAmount);
        }

        PaymentIntent paymentIntent;
        if (idempotencyKey != null && !idempotencyKey.trim().isEmpty()) {
            com.stripe.net.RequestOptions options = com.stripe.net.RequestOptions.builder()
                    .setIdempotencyKey(idempotencyKey)
                    .build();
            paymentIntent = PaymentIntent.create(builder.build(), options);
        } else {
            paymentIntent = PaymentIntent.create(builder.build());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("clientSecret", paymentIntent.getClientSecret());
        response.put("id", paymentIntent.getId());
        return response;
    }

    /**
     * Creates the platform charge for a server-calculated multi-seller order.
     * Seller transfers are intentionally deferred until the signed webhook has
     * confirmed funds; the aggregate ID becomes Stripe's transfer group.
     */
    public MarketplacePaymentIntent createMarketplacePaymentIntent(
            long amountCents,
            String currency,
            String marketplaceOrderId,
            String idempotencyKey) throws StripeException {
        if (amountCents <= 0) {
            throw new IllegalArgumentException("Payment amount must be positive");
        }
        if (marketplaceOrderId == null || marketplaceOrderId.isBlank()) {
            throw new IllegalArgumentException("Marketplace order ID is required");
        }
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            throw new IllegalArgumentException("Idempotency key is required");
        }

        String normalizedCurrency = currency == null ? "eur" : currency.toLowerCase();
        if (!"eur".equals(normalizedCurrency)) {
            throw new IllegalArgumentException("Only EUR marketplace checkout is supported");
        }

        if (isMock()) {
            String deterministicId = "pi_mock_" + UUID.nameUUIDFromBytes(
                    (marketplaceOrderId + ":" + idempotencyKey)
                            .getBytes(StandardCharsets.UTF_8))
                    .toString()
                    .replace("-", "");
            return new MarketplacePaymentIntent(
                    deterministicId,
                    deterministicId + "_secret_mock");
        }

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountCents)
                .setCurrency(normalizedCurrency)
                .addPaymentMethodType("card")
                .setTransferGroup(marketplaceOrderId)
                .putMetadata("marketplace_order_id", marketplaceOrderId)
                .build();
        com.stripe.net.RequestOptions options = com.stripe.net.RequestOptions.builder()
                .setIdempotencyKey("marketplace:" + idempotencyKey)
                .build();
        PaymentIntent paymentIntent = PaymentIntent.create(params, options);
        return new MarketplacePaymentIntent(
                paymentIntent.getId(),
                paymentIntent.getClientSecret());
    }

    public MarketplacePaymentIntent retrieveMarketplacePaymentIntent(
            String paymentIntentId) throws StripeException {
        if (paymentIntentId == null || paymentIntentId.isBlank()) {
            throw new IllegalArgumentException("PaymentIntent ID is required");
        }
        if (isMock()) {
            return new MarketplacePaymentIntent(
                    paymentIntentId,
                    paymentIntentId + "_secret_mock");
        }
        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
        return new MarketplacePaymentIntent(
                paymentIntent.getId(),
                paymentIntent.getClientSecret());
    }
}
