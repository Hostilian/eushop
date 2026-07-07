# EUshop — Compliance Gap Analysis & Audit Readiness

This document evaluates the compliance of the `eushop` platform with key European Union digital regulations. It outlines what is built, what needs human legal/technical review, and actionable remediation steps.

---

## 1. Food Information to Consumers Regulation (EU No 1169/2011)
**Requirement**: Mandatory display of allergens (e.g., gluten, nuts, dairy) and country of origin for pre-packed foods sold online before checkout completes.

### Current Implementation Status
*   **Database Schema (`foods` table)**:
    *   Has a `country` field (VARCHAR, NOT NULL).
    *   Has an `allergens` column (JSONB, NOT NULL) representing a JSON array of allergens (e.g., `["Gluten", "Nuts"]`).
    *   Has `dietary_restrictions` column (JSONB) representing a JSON array (e.g., `["Vegan"]`).
*   **Backend Validation**:
    *   `FoodController` and `Food` entity enforce allergen fields, but raw strings are validated with basic constraints.

### Action Items & Gaps
*   **Frontend Allergen Gating**: Ensure the UI does not allow a seller to post a food item without filling in the allergens field (even if it is `[]` or `["None"]`).
*   **Consumer Disclosure**: Allergens must be displayed in **bold** or contrasting typeface on the product detail page, in accordance with EU No 1169/2011 Art 21.

---

## 2. General Data Protection Regulation (GDPR)

### Article 17: Right to Erasure ("Right to be Forgotten")
*   **Backend implementation**: `UserService.anonymizeUser()` anonymizes all personal identifiers (nulling name, email, address, and replacing them with randomUUIDs or hashes) while preserving the core order/sales records for financial accounting.
*   **Data Minimization**: We stripped the raw IP address and User Agent columns from the `ConsentLog` entity, storing only the SHA-256 hashes (`ip_hash`, `user_agent_hash`).
*   **Legal Action**: Confirm that the 10-year storage limit for financial invoices containing anonymized user details complies with national tax laws (e.g., German *Abgabenordnung* or Belgian *Code des impôts*).

### Article 20: Right to Data Portability
*   **Backend implementation**: `UserService.exportUserData()` retrieves the user profile and order list and serializes them to a JSON format.
*   **Action Item**: Ensure the export format is directly downloadable in a structured, commonly used, machine-readable format (like JSON or CSV) directly from the user profile dashboard.

---

## 3. Digital Services Act (DSA) - KYBC Rules
**Requirement**: Online marketplaces must verify the identity, contact details, and business registration ("Know Your Business Customer") of sellers before allowing them to offer products to EU consumers.

### Current Implementation Status
*   **User Model**: Features a `kycVerified` (boolean) flag and `selfCertifiedCompliant` flag.
*   **Onboarding Flow**: Next.js seller onboarding collects:
    *   Company registration number (Trade Register Number)
    *   VAT identification number
    *   Tax ID

### Action Items & Gaps
*   **Verification Gate**: Ensure that sellers cannot make their listings `available = true` unless `kycVerified` is true in the database.
*   **Verification Logic**: The system currently relies on manual admin toggles for verification. To automate and scale, integrate an automated identity verification provider (e.g., Stripe Identity, Trulioo) to check the validity of trade register/VAT IDs.

---

## 4. DAC7 Tax Reporting Directive (EU 2021/514)
**Requirement**: Online platforms must collect, verify, and annually report tax information and transaction volumes of EU sellers to local tax authorities.

### Current Implementation Status
*   **Database Schema**: `004_dac7_reporting.sql` creates a `dac7_reports` table tracking annual sales, transactions, tax identification numbers, and country of tax residence.
*   **Take-Rate Application**: Handled via Stripe Connect application fees (15% platform take-rate).

### Action Items & Gaps
*   **Reporting Routines**: Create a cron job or automated administration report that compiles all seller earnings exceeding €2,000 or 30 transactions in a calendar year and exports it to XML format compliant with the local tax authority schema.
