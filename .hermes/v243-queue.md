# EUshop V243 Continuation Queue

Last updated: 2026-07-26T14:59:39Z

This queue is evidence-led. A historical `COMPLETED` claim is not accepted
until the current branch implementation and its narrow verification pass have
been inspected.

## READY

- [ ] **C-02** — Verify and complete the server-authoritative multi-seller
  order, Stripe Connect payout, refund, and idempotency flow.
- [ ] **FKG-01..03** — Verify canonical identities, ontology relations, and
  claim-level provenance against source and tests.
- [ ] **MAP-01..03** — Verify the spatial migration, actual MapLibre behavior,
  zoom semantics, and accessible list fallback.
- [ ] **PRD/TRU** — Verify the listing activation gate and persistent trader
  traceability journey from product detail through checkout.
- [ ] **PRV-03** — Replace or complete the static eAmbrosia verifier with a
  deterministic ingestion, normalization, validation, and evidence pipeline.
- [ ] **JOURNEY** — Run the narrow unit/integration suites, affected builds,
  `git diff --check`, and the critical buyer/seller journey.

## CHECKPOINT AND RELEASE

- [ ] Update `CHANGELOG.md`, V243 evidence docs, and all recovery state.
- [ ] Commit focused, stable units on the safe child branch.
- [ ] Create `.claude/AUTONOMOUS_COMPLETE` only when every goal-domain
  criterion above has current evidence and no required work remains.
