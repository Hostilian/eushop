# EUshop Regulatory Compliance Control Matrix (GDPR, DSA, DAC7, FIC 1169, WCAG 2.2 AA)

**Compliance Architectural Authority:** `packages/compliance/`  
**Sign-off Status:** Structural Implementation Complete (Pending Jurisdiction Legal Review)  

---

## 1. Compliance Control Mapping

| Regulation | Scope & Requirement | Technical Implementation | Single Source of Truth |
| :--- | :--- | :--- | :--- |
| **FIC 1169** | 14 Regulated Annex II Allergens & Mandatory Food Information | `FoodService.java` validation + allergen emphasis UI | `packages/compliance/src/allergens.ts` |
| **DAC7** | 30 transactions or €2,000 consideration threshold | `Dac7Service.java` annual aggregation & XML generator | `packages/compliance/src/vat.ts` (`DAC7_THRESHOLDS`) |
| **DSA Art. 30** | Persistent "Sold by [Seller]" UI & Trader Traceability | `DsaNoticeService.java` + mandatory seller KYBC gate | `apps/web/components/marketplace/` |
| **GDPR Art. 17** | Cascading erasure across subprocessors | `UserService.java` `anonymizeUser` endpoint | `services/core-service/` |
| **WCAG 2.2 AA** | Focus rings, contrast ratio ≥ 4.5:1, semantic landmarks | Design system tokens + axe-core Playwright audit | `apps/web/components/ui/` |
