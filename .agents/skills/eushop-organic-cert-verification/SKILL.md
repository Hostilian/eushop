---
name: eushop-organic-cert-verification
description: Skill for parsing and validating organic certification numbers and TRACES certificate status.
---

# Organic Certification Verification

## Overview
EU Organic Regulation 2018/848 governs the production, labelling, and control of organic products. Any product listed on EUshop with "organic", "bio", or "eco" claims must have a valid organic certificate with a recognisable control body code and pass TRACES certificate status verification.

// COMPLIANCE-REVIEW: Organic equivalence agreements (e.g. with UK, CH, US) affect which certificates are accepted for EU sale. Verify per origin country.

## Control Body Code Format

EU organic certificates include a control body code following this pattern:

```
{COUNTRY_ISO2}-{ORG}-{NUMBER}
```

**Examples:**
- `FR-BIO-01` → Ecocert France
- `DE-ÖKO-037` → Naturland
- `IT-BIO-006` → Bioagricert
- `ES-ECO-020` → Aenor
- `NL-BIO-01` → Skal Biocontrole

```typescript
// packages/compliance/src/organic.ts
const ORGANIC_CODE_PATTERN = /^[A-Z]{2}-[A-Z]{3,6}-\d{3,4}$/;

export function validateControlBodyCode(code: string): boolean {
  return ORGANIC_CODE_PATTERN.test(code.trim().toUpperCase());
}
```

## EU Organic Logo Requirements

```typescript
// packages/compliance/src/organic.ts
export interface OrganicLabelRequirements {
  euOrganicLogoRequired: boolean;  // Mandatory for EU-origin products
  originStatement: OrganicOriginStatement;
  controlBodyCode: string;
}

export type OrganicOriginStatement =
  | 'EU Agriculture'           // ≥95% ingredients from EU
  | 'Non-EU Agriculture'       // ≥95% ingredients from non-EU
  | 'EU/Non-EU Agriculture';   // Mixed origin

export function validateOrganicLabel(product: OrganicProduct): ValidationResult {
  const errors: string[] = [];
  if (!validateControlBodyCode(product.controlBodyCode)) {
    errors.push(`Invalid control body code: ${product.controlBodyCode}`);
  }
  if (!product.originStatement) {
    errors.push('Origin statement required (EU Agriculture / Non-EU Agriculture)');
  }
  if (product.origin === 'EU' && !product.hasEuOrganicLogo) {
    errors.push('EU organic logo mandatory for EU-origin organic products');
  }
  // COMPLIANCE-REVIEW: Verify Reg. 2018/848 Art. 32 logo placement rules
  return { valid: errors.length === 0, errors };
}
```

## TRACES Certificate Verification

TRACES (Trade Control and Expert System) is the EU system for tracing organic consignments from third countries:

```typescript
// packages/compliance/src/organic.ts
export async function verifyTracesCertificate(
  certificateNumber: string,
  originCountry: string
): Promise<TracesCertStatus> {
  if (isEuCountry(originCountry)) {
    // EU-origin products do not need TRACES CoI
    return { required: false, status: 'NOT_REQUIRED' };
  }
  // Non-EU origin requires Certificate of Inspection (CoI) via TRACES
  // COMPLIANCE-REVIEW: TRACES NT API access requires EU authority registration
  // Use offline CoI number format validation as fallback
  const coiPattern = /^[A-Z]{2}-ORG-\d{4}-\d{4,8}$/;
  return {
    required: true,
    status: coiPattern.test(certificateNumber) ? 'FORMAT_VALID' : 'FORMAT_INVALID',
    certificateNumber,
  };
}
```

## Platform Rules

- Products claiming "organic"/"bio"/"eco" without a valid control body code → **listing blocked**
- Non-EU origin organics without CoI → flagged for manual compliance review
- "In-conversion" products may not use the EU organic logo but may state "product under conversion to organic farming"
- Expired certificates → listing suspended until renewed certificate uploaded

## Source Files
- `packages/compliance/src/organic.ts`
- `packages/types/src/product.ts` — `OrganicCertification`
- `services/core-service/src/onboarding/OrganicValidationService.java`
