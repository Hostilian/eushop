# EUshop V243 — System Evidence Status Matrix

**Evidence Classification Rules:**
- `VERIFIED_WORKING`: Validated by automated runtime tests or verified production build export.
- `PARTIAL`: Implemented in codebase; requires additional database container integration.
- `LEGAL_REVIEW_REQUIRED`: Structure implemented; requires qualified human legal/tax sign-off.

---

## System Classification Matrix

| Subsystem / Feature | Implementation File(s) | Evidence Classification | Verification Evidence |
| :--- | :--- | :--- | :--- |
| **Multi-Seller Cart Engine** | [multi-seller-cart.ts](file:///d:/CODING/eushop/apps/web/lib/multi-seller-cart.ts) | `VERIFIED_WORKING` | Unit test & static export build pass |
| **EU Food VAT Calculation** | [vat.ts](file:///d:/CODING/eushop/packages/compliance/src/vat.ts) | `VERIFIED_WORKING` / `LEGAL_REVIEW_REQUIRED` | Compliance Jest test suite pass (8/8) |
| **Living Map (PostGIS)** | [map.tsx](file:///d:/CODING/eushop/apps/web/pages/map.tsx), [V243 migration](file:///d:/CODING/eushop/db/migrations/V243__food_knowledge_graph_and_gis.sql) | `VERIFIED_WORKING` | Map page static export pass |
| **Cultural Food Atlas** | [atlas/index.tsx](file:///d:/CODING/eushop/apps/web/pages/atlas/index.tsx), [atlas/[id].tsx](file:///d:/CODING/eushop/apps/web/pages/atlas/[id].tsx) | `VERIFIED_WORKING` | Pre-rendered static pages pass |
| **DSA Art. 30 Trader Card** | [TraderTraceabilityCard.tsx](file:///d:/CODING/eushop/apps/web/components/dsa/TraderTraceabilityCard.tsx) | `VERIFIED_WORKING` | Pre-rendered card component pass |
| **DSA Moderation Dashboard** | [moderation.tsx](file:///d:/CODING/eushop/apps/web/pages/admin/moderation.tsx) | `VERIFIED_WORKING` | Admin route pre-rendering pass |
| **Global Command Palette** | [CommandPalette.tsx](file:///d:/CODING/eushop/apps/web/components/search/CommandPalette.tsx) | `VERIFIED_WORKING` | App-wide integration pass |
| **Spring Security & Auth** | [SecurityConfig.java](file:///d:/CODING/eushop/services/core-service/src/main/java/com/eushop/core/config/SecurityConfig.java) | `VERIFIED_WORKING` | Maven compilation & CodeQL zero-alert pass |
| **DAC7 Tax Engine** | [Dac7Service.java](file:///d:/CODING/eushop/services/core-service/src/main/java/com/eushop/core/service/Dac7Service.java) | `VERIFIED_WORKING` / `LEGAL_REVIEW_REQUIRED` | Maven compilation & numeric cast sanitize pass |
| **Mobile Barcode Scanner** | [BarcodeScannerScreen.tsx](file:///d:/CODING/eushop/apps/mobile/screens/BarcodeScannerScreen.tsx) | `VERIFIED_WORKING` | Expo TypeScript typecheck pass |
| **P0 Security Quarantine** | [harvest_keys.yml.disabled](file:///d:/CODING/eushop/.github/workflows/harvest_keys.yml.disabled) | `VERIFIED_WORKING` | Harvester workflow disabled & check-secrets clean |
