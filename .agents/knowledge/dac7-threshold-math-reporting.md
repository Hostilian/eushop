# DAC7 Threshold Math & Reporting Logic

## Overview
DAC7 (Council Directive 2021/514) requires EU marketplace operators to report seller data to national tax authorities annually.

## Thresholds (verify against primary sources before relying)
A seller must be reported if in a calendar year they have:
- **30 or more** reportable transactions, OR
- **€2,000 or more** total consideration from reportable transactions

## Source of Truth
`packages/compliance/src/vat.ts` — `DAC7_THRESHOLDS` constant

## Never Copy to Client
DAC7 threshold values MUST only be read from `packages/compliance/src/vat.ts`. Never hand-copy into frontend or other packages.

## Reporting Timeline
- Aggregate data: monthly cron job
- Submit report: by January 31 of following year
- Archive: minimum 7 years

## Required Seller Data Points (per DAC7)
1. Full legal name
2. Primary address
3. TIN (Tax Identification Number)
4. Date of birth (natural persons) or company registration number
5. Financial account identifier (IBAN)
6. Total consideration per quarter
7. Number of reportable activities per quarter

// COMPLIANCE-REVIEW: Verify against Council Directive 2021/514 before any reporting
