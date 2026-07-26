# Seller Onboarding DSA Art. 30 Verification Flow

## Overview
DSA Art. 30 requires EUshop to collect and verify 5 data points from traders before they can list products.

## Required Data Points
1. **Legal name** — company name or full legal name (natural person)
2. **Postal address** — registered business address
3. **Email address** — direct contact for DSA enforcement notices
4. **Phone number** — direct contact
5. **VAT number** — or national business registration number (if VAT-exempt micro-business)

## Verification Process
```typescript
// Verification is structural — EUshop collects data, does NOT certify authenticity
// That is a lawyer's call. COMPLIANCE-REVIEW required.
const verifyArt30 = (profile: SellerProfile): Art30Status => {
  const missing = [];
  if (!profile.legalName) missing.push('legalName');
  if (!profile.postalAddress) missing.push('postalAddress');
  if (!profile.email) missing.push('email');
  if (!profile.phone) missing.push('phone');
  if (!profile.vatNumber && !profile.registrationNumber) missing.push('vatNumber or registrationNumber');

  return {
    isComplete: missing.length === 0,
    missingFields: missing,
    verifiedAt: missing.length === 0 ? new Date() : null,
  };
};
```

## UI Requirement
"Sold by [Legal Name]" must appear:
- On every product listing page (non-decorative)
- In checkout cart per item
- On order confirmation
- In invoice

## Blocking Rule
Products may NOT be listed until Art. 30 verification is complete.
