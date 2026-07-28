---
name: eushop-ce-mark-compliance
description: Skill for verifying CE conformity declarations, Notified Body numbers, and technical documentation completeness.
---

# CE Mark Compliance Verification

## Overview
The CE mark (Conformité Européenne) is a mandatory conformity marking for products placed on the EU market under applicable New Approach Directives and Regulations. EUshop must verify seller-uploaded EU Declarations of Conformity (DoC) and validate CE mark formatting before allowing product listings in affected categories.

// COMPLIANCE-REVIEW: CE mark requirements differ per product directive. Ensure correct directive is applied for each product category. This is not a lawyer's assessment.

## Applicable Directives (Key)

| Directive | Product Category | Notified Body Required? |
|-----------|----------------|------------------------|
| LVD 2014/35/EU | Electrical equipment (50–1000V AC) | No (self-declaration) |
| EMC 2014/30/EU | Electronic devices | No (self-declaration) |
| MD 2006/42/EC | Machinery | Only for Annex IV products |
| TOYS 2009/48/EC | Toys | Only for specific categories |
| PPE 2016/425/EU | Personal protective equipment | Cat. II/III require NB |
| RED 2014/53/EU | Radio equipment | Yes for some categories |
| CPR 305/2011 | Construction products | Yes (harmonised standards) |

## Declaration of Conformity (DoC) Validation

```typescript
// packages/compliance/src/ceMark.ts
export interface DeclarationOfConformity {
  productName: string;
  productModel: string;
  manufacturerName: string;
  manufacturerAddress: string;     // Must include EU establishment
  applicableDirectives: string[];  // E.g. ['2014/35/EU', '2014/30/EU']
  harmonisedStandards: string[];   // E.g. ['EN 60950-1:2006+A11', 'EN 55032:2015']
  notifiedBodyNumber?: string;     // 4-digit number, required for some categories
  notifiedBodyName?: string;
  declarationDate: Date;
  signatoryName: string;
  documentUrl: string;             // PDF link
}

export function validateDoC(doc: DeclarationOfConformity): ValidationResult {
  const errors: string[] = [];
  if (!doc.applicableDirectives || doc.applicableDirectives.length === 0) {
    errors.push('At least one applicable directive must be listed');
  }
  if (doc.notifiedBodyNumber && !/^\d{4}$/.test(doc.notifiedBodyNumber)) {
    errors.push('Notified Body number must be exactly 4 digits');
  }
  if (!doc.harmonisedStandards || doc.harmonisedStandards.length === 0) {
    errors.push('At least one harmonised standard must be referenced');
  }
  // COMPLIANCE-REVIEW: Validate notified body number against NANDO database
  return { valid: errors.length === 0, errors };
}
```

## CE Mark Physical Requirements

```typescript
// Minimum height: 5mm (when no minimum size restriction applies)
// Proportions must be maintained when scaled
// Must be affixed visibly, legibly, and indelibly
// Notified Body number must be same height as CE mark and follow it immediately
export const CE_MARK_MIN_HEIGHT_MM = 5;
```

## NANDO Database Check (Notified Bodies)

```typescript
// packages/compliance/src/ceMark.ts
export async function verifyNotifiedBody(nbNumber: string): Promise<boolean> {
  // NANDO (New Approach Notified and Designated Organisations) database
  const url = `https://ec.europa.eu/growth/tools-databases/nando/index.cfm?fuseaction=notifiedbody.notifiedbody&id_nf=${nbNumber}`;
  // COMPLIANCE-REVIEW: NANDO does not have a public API; implement screen-scrape with caution
  // or use a third-party CE compliance data provider
  return true; // placeholder
}
```

## Product Listing Gate

- CE mark image must be uploaded and validated (aspect ratio check)
- DoC PDF must be uploaded and accessible via public URL
- Seller must tick "I confirm this product meets all applicable CE mark requirements" (self-attestation)
- For Notified Body categories: NB number must be provided and format-validated

## Source Files
- `packages/compliance/src/ceMark.ts`
- `packages/types/src/product.ts` — `DeclarationOfConformity`
- `services/core-service/src/onboarding/CeMarkValidationService.java`
