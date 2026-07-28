---
name: eushop-weee-e-waste-registration
description: Skill for parsing national WEEE producer registration formats (e.g. stiftung ear in DE, SYDEREP in FR).
---

# WEEE E-Waste Registration

## Overview
EU Directive 2012/19/EU (WEEE) requires producers and marketplace operators to verify that sellers of electrical/electronic equipment (EEE) hold valid national producer registrations before allowing listings. EUshop acts as a marketplace facilitator and must enforce registration checks per destination country.

// COMPLIANCE-REVIEW: National WEEE register formats and APIs differ per member state. Verify against each country's authority before going live.

## Covered Product Categories (WEEE Annex III)

| Category | Examples |
|----------|---------|
| 1 – Large household appliances | Washing machines, fridges, ovens |
| 2 – Small household appliances | Toasters, irons, clocks |
| 3 – IT & telecom equipment | Laptops, phones, tablets |
| 4 – Consumer equipment | TVs, cameras, speakers |
| 5 – Lighting equipment | LED lamps, fluorescent tubes |
| 6 – Electrical/electronic tools | Drills, sewing machines |
| 7 – Toys, leisure & sports | Electric toy cars, treadmills |

## National Registration Formats

| Country | Registry | Registration Format | API |
|---------|---------|--------------------|----|
| DE | Stiftung EAR | `WEEE-Reg.-Nr. DE12345678` | ear-online.de |
| FR | SYDEREP | `FR000000_000001X` | syderep.ademe.fr |
| UK | Environment Agency | `WEEENNNNNNN` | gov.uk (post-Brexit) |
| ES | RAEE | `ES/RAEE/NP/12345` | miteco.gob.es |
| IT | CdC RAEE | IT-number | cdcraee.it |

## Validation Logic

```typescript
// packages/compliance/src/weee.ts
const WEEE_PATTERNS: Record<string, RegExp> = {
  DE: /^WEEE-Reg\.-Nr\. DE\d{8}$/,
  FR: /^FR\d{6}_\d{6}[A-Z]$/,
  ES: /^ES\/RAEE\/NP\/\d{5}$/,
  // COMPLIANCE-REVIEW: Add IT, NL, PL, BE patterns after confirming with local counsel
};

export function validateWeeeRegistration(
  country: string,
  registrationNumber: string
): boolean {
  const pattern = WEEE_PATTERNS[country];
  if (!pattern) return false; // block listing in unsupported country
  return pattern.test(registrationNumber.trim());
}
```

## Seller Onboarding Gate

```typescript
// Applied during DSA Art. 30 seller onboarding check
if (product.category === 'EEE' && sellerTargetMarkets.includes('EU')) {
  for (const countryCode of sellerTargetMarkets) {
    const reg = seller.weeeRegistrations[countryCode];
    if (!validateWeeeRegistration(countryCode, reg)) {
      throw new ComplianceBlockError(
        `WEEE registration invalid for ${countryCode}. Listing blocked.`
      );
    }
  }
}
```

## UI Requirements

- Display WEEE take-back symbol (crossed-out wheelie bin) on all EEE product pages
- Provide link to seller's take-back scheme or EU-wide take-back points
- Show registration number in seller compliance card per country

## Source Files
- `packages/compliance/src/weee.ts`
- `packages/types/src/seller.ts` — `weeeRegistrations` field
- `services/core-service/src/onboarding/WeeeValidationService.java`
