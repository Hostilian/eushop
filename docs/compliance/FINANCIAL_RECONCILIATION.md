# EUshop Financial Reconciliation & Double-Entry Ledger Engine Audit

**Compliance Standards:** Single Source of Truth (`Money.java`), Zero Floating Point Currency Arithmetic  

---

## 1. Reconciliation Invariants

1. **Balance Equation**: $\text{Gross Order Amount} = \text{Seller Net Payout} + \text{Platform Finder Fee} + \text{Destination VAT}$.
2. **Double-Entry Ledger Tracking**: Every payment event produces a corresponding credit and debit entry in `OutboxEvent.java` with immutable timestamps.
3. **Rounding Invariant**: All intermediate calculations maintain 4-decimal precision before rounding to 2-decimal EUR via `RoundingMode.HALF_UP`.
