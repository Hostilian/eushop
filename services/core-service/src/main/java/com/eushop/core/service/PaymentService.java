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
import java.util.HashMap;
import java.util.Map;

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

    public Map<String, Object> createPaymentIntent(Double amount, String currency, String sellerAccountId) throws StripeException {
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

        PaymentIntent paymentIntent = PaymentIntent.create(builder.build());
        Map<String, Object> response = new HashMap<>();
        response.put("clientSecret", paymentIntent.getClientSecret());
        response.put("id", paymentIntent.getId());
        return response;
    }
}
