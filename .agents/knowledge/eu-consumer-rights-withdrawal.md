# EU Consumer Rights Directive — Withdrawal & Returns

## Overview
Directive 2011/83/EU on consumer rights mandates 14-day withdrawal right for all online marketplace purchases.

## Key Requirements
- **14-day cooling-off period** from delivery date
- Buyer can return for ANY reason (no fault required)
- Seller pays return postage UNLESS explicitly stated otherwise in pre-purchase disclosure
- Refund within 14 days of receiving return (or proof of postage)
- Model withdrawal form must be available

## Exceptions (Right of Withdrawal Does NOT Apply)
- Perishable foods (short shelf life)
- Custom/personalised products
- Sealed hygiene products opened after delivery
- Digital downloads after access granted

## EUshop Implementation
```sql
-- Order table requirements
ALTER TABLE orders ADD COLUMN withdrawal_deadline TIMESTAMPTZ
    GENERATED ALWAYS AS (delivered_at + INTERVAL '14 days') STORED;
ALTER TABLE orders ADD COLUMN withdrawal_requested_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN refund_deadline TIMESTAMPTZ
    GENERATED ALWAYS AS (COALESCE(return_received_at, withdrawal_requested_at) + INTERVAL '14 days') STORED;
```

## UI Requirements
- Withdrawal deadline displayed on order confirmation page
- Return initiation flow must be < 3 clicks from order history
- Refund progress tracker

// COMPLIANCE-REVIEW: Perishable food exception requires product-by-product legal assessment
