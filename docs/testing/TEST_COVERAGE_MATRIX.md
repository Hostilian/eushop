# EUshop Backend Test Coverage & Integration Test Matrix

**Frameworks:** JUnit 5, Spring Boot Test, Mockito, JaCoCo  
**Current Backend Suite:** 61 / 61 Unit & Integration Tests Passing (100% Success)  

---

## 1. Test Suite Coverage Breakdown

| Package / Domain | Unit & Integration Test Classes | Key Scenarios Verified |
| :--- | :--- | :--- |
| **Monetary Engine** | `MoneyTest.java`, `MoneyPropertyTest.java` | Scale 2 `HALF_UP` rounding, currency mismatch, 100 random property invariants |
| **Security Hardening** | `SecurityHardeningTest.java`, `SecurityAndControllerTest.java` | Path traversal rejection (`/etc/passwd`), `.exe` upload restriction, RBAC roles |
| **DSA Moderation** | `DsaNoticeServiceTest.java`, `ModerationServiceTest.java` | Notice intake, trader identity audit, Statements of Reasons issuance |
| **DAC7 Tax Reporting** | `Dac7ServiceTest.java` | Annual consideration aggregation (€2,000 threshold), XML snapshot generation |
| **Stripe Webhooks** | `WebhookControllerTest.java` | `Stripe-Signature` validation, payment confirmation, event deduplication |
| **Architecture Rules** | `ArchitectureTest.java` | Modular monolith layer isolation and package boundary enforcement |
