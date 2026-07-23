# EUshop Version 99 Privacy Data Map & GDPR Compliance

> Data Classification and In-App Privacy Controls Inventory.

---

## 1. Personal Data Inventory

| Data Element | Purpose | Legal Basis | Storage Location | Retention Period | Deletion Mechanism |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Email Address** | Authentication & Order receipts | Contractual necessity (Art. 6(1)(b)) | Encrypted DB (`users` table) | Account duration + 7 yrs tax audit | In-app deletion initiation (`GDPRScreen.tsx`) |
| **Shipping Address** | Cross-border physical food delivery | Contractual necessity (Art. 6(1)(b)) | Encrypted DB (`addresses` table) | Order completion + 2 yrs warranty | User profile edit / deletion |
| **Dietary & Allergen Preferences** | Filtering food listings for consumer safety | Explicit Consent (Art. 9(2)(a)) | Encrypted local storage | Until modified by user | In-app settings reset |
| **Trader Identity Data (Tax/VAT ID)** | DSA Art. 30 & DAC7 compliance reporting | Legal obligation (Art. 6(1)(c)) | Secured compliance DB | 10 years statutory tax requirement | Administrative legal review |

---

## 2. In-App Privacy Controls
- **Data Portability (GDPR Art. 20)**: Handled via `GDPRScreen.tsx` (`Export My Data Archive`).
- **Right to Erasure (GDPR Art. 17)**: Handled via `GDPRScreen.tsx` (`Request Account Erasure`).
