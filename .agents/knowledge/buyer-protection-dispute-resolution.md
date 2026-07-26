# Buyer Protection & Dispute Resolution

## Overview
EUshop must provide a dispute resolution mechanism per DSA Art. 21 and EU Consumer Rights Directive.

## Dispute Resolution Flow
```
1. Buyer raises dispute (max 45 days from delivery)
2. EUshop notifies seller (48h to respond)
3. Seller response or no response after 48h
4. Mediator review (3 business days)
5. Resolution: full refund / partial refund / reject
6. Escalation: EU ADR entity if buyer disagrees
```

## ADR (Alternative Dispute Resolution) Obligation
EU Directive 2013/11/EC requires online marketplaces to:
- Provide link to EU ODR Platform (ec.europa.eu/consumers/odr)
- Inform buyers of their right to ADR
- Cooperate with ADR proceedings

## Database Requirements
```sql
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  buyer_id UUID NOT NULL REFERENCES users(id),
  seller_id UUID NOT NULL REFERENCES seller_profiles(id),
  reason TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('OPEN', 'SELLER_RESPONSE', 'MEDIATION', 'RESOLVED', 'ESCALATED')),
  raised_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolution TEXT,
  refund_amount_cents INTEGER
);
```

## EU ODR Link
Must appear: footer, checkout confirmation, and all order emails.
Link: https://ec.europa.eu/consumers/odr

// COMPLIANCE-REVIEW: Verify ADR entity registration requirement with legal
