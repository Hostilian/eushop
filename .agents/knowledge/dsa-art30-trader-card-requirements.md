# DSA Art. 30 Trader Card Data Requirements

## Overview
Digital Services Act Art. 30 requires online marketplaces to collect, verify, and display five mandatory data points for all professional traders before they can list products.

## 5 Required Data Points (DSA Art. 30)
1. **Legal name** — full registered business name
2. **Postal address** — registered business address (not PO Box)
3. **Email address** — business contact email
4. **Telephone number** — direct contact number
5. **VAT/Trader registration number** — national business ID

## UI Requirements
"Sold by [Seller Name]" MUST be:
- Persistent on all product listing pages
- Non-decorative (must be visible without user action)
- Linked to full trader card with all 5 data points

## Database Schema
```sql
ALTER TABLE seller_profiles ADD COLUMN dsa_art30_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE seller_profiles ADD COLUMN dsa_art30_verified_at TIMESTAMPTZ;
```

## Blocking Rule
No product listing goes live without `dsa_art30_verified = TRUE`.

// COMPLIANCE-REVIEW: Verify implementation against DSA Art. 30 text and EDPB guidance
