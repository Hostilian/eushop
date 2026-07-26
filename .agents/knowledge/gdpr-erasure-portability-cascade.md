# GDPR Erasure & Portability Cascade Pattern

## Overview
GDPR Art. 17 (right to erasure) and Art. 20 (data portability) must cascade to ALL subprocessors.

## Cascade Targets
1. **PostgreSQL** — hard delete (not soft delete flag) from all user tables
2. **OpenSearch** — delete all indexed user documents
3. **Stripe** — submit data deletion request to Stripe Support
4. **Auth0** — DELETE via Management API: `DELETE /api/v2/users/{id}`
5. **Email provider** — remove from subscriber lists

## Erasure Sequence
```typescript
async function cascadeErasure(userId: string) {
  await db.transaction(async (trx) => {
    await trx('gdpr_erasure_requests').insert({ userId, requestedAt: now() });
    await trx('orders').where({ userId }).update({ buyer_anonymized: true });
    await trx('users').where({ id: userId }).delete();
  });
  await opensearch.deleteByQuery({ userId });
  await auth0.deleteUser(userId);
  await logErasureAuditTrail(userId); // immutable log
}
```

## Portability Export (Art. 20)
- Format: machine-readable JSON
- Include: orders, reviews, profile data
- Exclude: fraud signals, internal notes
- Delivery: secure download link, 30-day expiry

// COMPLIANCE-REVIEW: Verify erasure cascade completeness with DPO before production deployment
