# Stripe Connect Split Payment Architecture

## Overview
EUshop uses Stripe Connect (Express accounts) to route payments: buyer pays EUshop → platform fee deducted → seller receives remainder.

## Payment Flow
```
Buyer (€100) → EUshop Stripe account
  ├── Platform fee (5%): €5 stays with EUshop
  └── Seller transfer (95%): €95 → seller's Stripe Connect account

Payment Intent creation (server-authoritative):
{
  amount: 10000,  // €100.00 in cents
  currency: "eur",
  application_fee_amount: 500,  // €5.00 platform fee
  transfer_data: { destination: "acct_seller_stripe_id" }
}
```

## Idempotency Pattern
```java
// Always use idempotency key = orderId
StripeClient.paymentIntents().create(
    PaymentIntentCreateParams.builder()
        .setAmount(order.getAmountCents())
        .setCurrency("eur")
        .setApplicationFeeAmount(platformFee)
        .setTransferData(TransferDataParams.builder()
            .setDestination(seller.getStripeAccountId()).build())
        .build(),
    RequestOptions.builder()
        .setIdempotencyKey(order.getId().toString()).build()
);
```

## Never Do
- Never calculate amount client-side — always server-authoritative
- Never expose `STRIPE_SECRET_KEY` in any frontend code
- Never skip idempotency key (causes double charges)

## Webhook Signature Verification
```java
Event event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
// ALWAYS verify before processing — reject unsigned webhooks with 400
```
