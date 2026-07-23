# EUshop Version 99 EU Compliance Control Matrix

> Single Source of Truth mapping regulatory requirements to technical implementations.

---

## 1. Compliance Mapping Table

| Regulation | Mandatory Control | Technical Implementation | Code Location | Verification Method |
| :--- | :--- | :--- | :--- | :--- |
| **FIC Reg. 1169/2011 Annex II** | 14 mandatory food allergen declarations before purchase | `@eushop/compliance` allergen engine & badges | `packages/compliance/src/allergens.ts` | Automated unit tests |
| **DSA Reg. 2022/2065 Art. 30** | Named trader identity ("Sold by Trader") on product listings | Mandatory business name, address & trade register entry | `apps/mobile/screens/ListingUploadScreen.tsx` | Schema validation |
| **EU VAT Directive 2006/112/EC** | Destination-based VAT calculation for cross-border B2C | Single market VAT rates table (27 member states) | `packages/compliance/src/vat.ts` | VatEngine tests |
| **DAC7 Directive 2021/514** | Reporting thresholds (30 sales or €2,000 consideration) | Transaction counter & seller threshold tracking | `packages/compliance/src/vat.ts` | DAC7 threshold tests |
| **GDPR Reg. 2016/679** | In-app account deletion initiation & data export | Direct erasure request & portability download | `apps/mobile/screens/GDPRScreen.tsx` | UI verification tests |

---

## 2. Qualified Legal Sign-Off Note
- **COMPLIANCE-REVIEW Gate**: All compliance structures provide technical framework enforcement. Formal certification in individual EU member states requires qualified legal and tax advisor sign-off.
