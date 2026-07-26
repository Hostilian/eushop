# PDO/PGI Protected Designation Reference

## Overview
EUshop displays PDO (Protected Designation of Origin), PGI (Protected Geographical Indication), and TSG (Traditional Speciality Guaranteed) badges on qualifying EU food products.

## EU Designation Types
| Badge | Full Name | Meaning |
|-------|-----------|---------|
| PDO 🔴 | Protected Designation of Origin | Production, processing AND preparation in region |
| PGI 🔵 | Protected Geographical Indication | At least ONE stage in region |
| TSG 🟡 | Traditional Speciality Guaranteed | Traditional recipe/method, no geographic link |

## Database Schema
```sql
ALTER TYPE product_designation AS ENUM ('PDO', 'PGI', 'TSG', 'NONE');
ALTER TABLE products ADD COLUMN designation product_designation DEFAULT 'NONE';
ALTER TABLE products ADD COLUMN eu_registration_number TEXT; -- e.g. "EL/PGI/0005/0020"
```

## Spatial Validation
PDO products must originate within their registered geographic area (PostGIS boundary check).
See `postgis-spatial-query-patterns.md` for implementation.

## Source Verification
EU geographical indications register: https://www.tmdn.org/giview/

// COMPLIANCE-REVIEW: Only display PDO/PGI badges after verifying EU registration number
