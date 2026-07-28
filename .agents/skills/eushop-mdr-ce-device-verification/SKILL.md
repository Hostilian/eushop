---
name: eushop-mdr-ce-device-verification
description: Skill for parsing UDI codes, verifying EUDAMED registrations, and checking Class I-III medical device CE documentation.
---

# EU Medical Device Regulation (MDR 2017/745) — Device Verification

## Overview
Regulation (EU) 2017/745 (MDR) governs the placing on market of medical devices in the EU. EUshop must verify UDI codes, EUDAMED registrations, and class-appropriate conformity documentation before listing medical devices. General wellness products are excluded; any product making a medical claim must be treated as a medical device.

// COMPLIANCE-REVIEW: MDR classification is complex. A "wellness" product can become a medical device if it makes diagnostic or therapeutic claims. Have each borderline case reviewed by a regulatory affairs specialist.

## Device Classification (MDR Annex VIII)

| Class | Risk Level | Conformity Route | Notified Body Required |
|-------|-----------|-----------------|----------------------|
| Class I (general) | Low | Self-declaration (QMS) | No |
| Class I (sterile/measuring) | Low–Medium | NB review of manufacturing | Yes |
| Class IIa | Medium | NB conformity assessment | Yes |
| Class IIb | Medium–High | NB design examination | Yes |
| Class III | High | EU-type examination | Yes (thorough) |

## Unique Device Identifier (UDI)

```typescript
// packages/compliance/src/mdr.ts
export interface UdiCode {
  udiDi: string;        // Device Identifier — identifies device model (on EUDAMED)
  udiPi?: string;       // Production Identifier — lot/batch, serial, expiry (on label)
  issuer: 'GS1' | 'HIBC' | 'ICCBBA' | 'IFA';
}

// GS1 GTIN-based UDI-DI format
const GS1_UDI_DI_PATTERN = /^\(01\)\d{14}$/;
// HIBC format
const HIBC_UDI_DI_PATTERN = /^\+[A-Z]{1,4}[A-Z0-9]{1,18}\/[A-Z0-9]{2,18}$/;

export function validateUdiDi(code: string, issuer: UdiCode['issuer']): boolean {
  switch (issuer) {
    case 'GS1': return GS1_UDI_DI_PATTERN.test(code);
    case 'HIBC': return HIBC_UDI_DI_PATTERN.test(code);
    default: return code.length > 0; // Other issuers: format-verify manually
  }
}
```

## EUDAMED Database Verification

```typescript
// packages/compliance/src/mdr.ts
export async function verifyEudamedRegistration(udiDi: string): Promise<EudamedRecord | null> {
  // EUDAMED public search endpoint
  // COMPLIANCE-REVIEW: EUDAMED full functionality was delayed. Check current public data availability
  const url = `https://ec.europa.eu/tools/eudamed/api/devices/udiDis/${encodeURIComponent(udiDi)}`;
  const response = await fetch(url);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`EUDAMED lookup failed: ${response.status}`);
  return response.json();
}

export interface EudamedRecord {
  udiDi: string;
  deviceName: string;
  riskClass: 'I' | 'IIA' | 'IIB' | 'III';
  authorizedRepresentativeName: string;
  authorizedRepresentativeCountry: string;
  notifiedBodyNumber?: string;
  certificateNumber?: string;
  certificateExpiry?: Date;
}
```

## Conformity Documentation Required by Class

```typescript
// packages/compliance/src/mdr.ts
export function getRequiredDocuments(deviceClass: 'I' | 'IIA' | 'IIB' | 'III'): string[] {
  const base = [
    'EU Declaration of Conformity',
    'Technical documentation summary',
    'Instructions for Use (IFU) URL',
    'Authorised Representative EU contact',
  ];

  if (deviceClass === 'I') return base;

  return [
    ...base,
    'Notified Body certificate number',
    'Notified Body name',
    'Certificate expiry date',
    ...(deviceClass === 'III' ? ['Clinical investigation summary', 'PMCF plan'] : []),
  ];
}
```

## Product Listing Gate

```typescript
if (product.isMedicalDevice) {
  const docs = getRequiredDocuments(product.deviceClass);
  const missingDocs = docs.filter(doc => !seller.uploadedDocuments.includes(doc));

  if (missingDocs.length > 0) {
    throw new ComplianceBlockError(
      `Medical device listing blocked. Missing: ${missingDocs.join(', ')}`
    );
  }

  const eudamed = await verifyEudamedRegistration(product.udiDi);
  if (!eudamed) {
    // COMPLIANCE-REVIEW: EUDAMED lookup failure should not automatically block — log for manual review
    await flagForManualReview(product.id, 'EUDAMED_LOOKUP_FAILED');
  }
}
```

## UI Display Requirements

- UDI-DI displayed on product detail page in machine-readable format
- Link to EUDAMED entry when available
- "Medical Device" badge visible on listing card
- Authorised Representative EU contact shown in seller compliance card

## Source Files
- `packages/compliance/src/mdr.ts`
- `packages/types/src/product.ts` — `MedicalDeviceMetadata`
- `apps/web/components/product/MedicalDeviceBadge.tsx`
- `services/core-service/src/onboarding/MdrValidationService.java`
