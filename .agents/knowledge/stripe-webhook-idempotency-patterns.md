# Stripe Connect Webhook Idempotency Patterns

## Overview
EUshop uses Stripe Connect for marketplace payments with split payouts. This KI documents the established patterns for webhook handling and idempotency.

## Key Patterns

### Idempotency Keys
All Stripe API calls MUST include idempotency keys:
```typescript
await stripe.paymentIntents.create(data, {
  idempotencyKey: `pi-${orderId}-${timestamp}`
});
```

### Webhook Signature Validation
```typescript
const event = stripe.webhooks.constructEvent(
  payload, sig, process.env.STRIPE_WEBHOOK_SECRET
);
```

### Event Types to Handle
- `payment_intent.succeeded` → fulfill order
- `payment_intent.payment_failed` → notify buyer
- `transfer.created` → log seller payout
- `account.updated` → refresh seller KYB status

## Source Files
- `services/core-service/src/stripe/`
- `packages/compliance/src/stripe.ts`

// COMPLIANCE-REVIEW: Verify split payment calculations with tax advisor
