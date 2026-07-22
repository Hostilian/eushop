# EUshop GDPR Article 17 Cascading Erasure & Anonymization Audit

**Compliance Authority:** `UserService.java` & `packages/compliance/`  
**Lawful Basis Mapping:** Performance of Contract (Art. 6(1)(b)) & Legal Obligation (Art. 6(1)(c))  

---

## 1. Cascading Erasure Protocol

When a user requests account deletion:
1. **User Entity**: Personal fields (`email`, `fullName`, `phone`, `vatNumber`, `iban`) are wiped and overwritten with `ANONYMIZED-[UUID]`.
2. **Order History**: Historical financial transactions (`orders`) remain for 10-year tax compliance under DAC7, but all direct PII links are anonymized.
3. **Subprocessors**: Erasure signal is propagated to Auth0, Stripe, and analytics processors.
