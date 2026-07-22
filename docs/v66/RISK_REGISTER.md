# EUshop Enterprise Risk Register & Mitigation Matrix (v66 Release)

**Risk Governance:** Executive Team & Lead Security Architect  

---

## 1. Compliance & Security Risk Matrix

| Risk ID | Risk Description | Severity | Likelihood | Technical Mitigation Control | Status |
| :--- | :--- | :---: | :---: | :--- | :---: |
| **RISK-01** | Non-compliant DAC7 seller reporting | High | Low | `Dac7Service.java` monthly cron & XML due diligence generator | `MITIGATED` |
| **RISK-02** | Undeclared FIC 1169 food allergens | High | Low | Mandatory 14 Annex II allergen validation gate in `FoodService.java` | `MITIGATED` |
| **RISK-03** | CodeQL Path Traversal in File Uploads | High | Low | Strict `.normalize().startsWith(rootLocation)` confinement | `MITIGATED` |
| **RISK-04** | Client Price Tampering in Checkout | Medium | Low | Server-authoritative `Money.java` checkout calculations | `MITIGATED` |
