# EUshop Version 177 — Product Decision Record (Product Truth)

---

## 1. Product Truth Matrix

| Decision Axis | Established Truth | Repository Source / Verification |
| :--- | :--- | :--- |
| **Who Buys?** | Pan-European consumers across 27 EU member states seeking authentic regional specialties. | `apps/web/pages/index.tsx`, `packages/compliance/src/vat.ts` |
| **Who Sells?** | Verified, commercial European specialty food producers and distributors. | `services/core-service/.../UserController.java` (`/become-seller`) |
| **Merchant of Record** | Stripe Connect Direct/Custom Account structure — sellers are merchants of record; EUshop acts as platform operator. | `services/core-service/.../PaymentController.java` |
| **Permitted Categories** | Artisanal Cheeses, Cured Meats, Extra Virgin Olive Oils, Organic Wines, Preserves & Pantry Staples. | `packages/types/src/product.ts` |
| **Possession & Fulfillment** | Direct-to-Consumer (D2C) fulfillment by independent commercial sellers; EUshop provides cross-border logistics tracking. | `services/core-service/.../OrderService.java` |
| **Pricing Authority** | Commercial sellers determine item base prices; platform applies verified VAT and transparent shipping fees. | `packages/compliance/src/vat.ts` |
| **Returns & Refunds** | Perishable food exception under EU Consumer Rights Directive (Directive 2011/83/EU Art. 16(d)); non-perishables carry 14-day statutory return. | `docs/compliance/RETURNS_POLICY.md` |
| **Food Safety Incidents** | Automated lot/batch suspension and buyer notification protocol under Regulation (EC) No 178/2002. | `services/core-service/.../DsaNoticeService.java` |
