---
name: eushop-reach-svhc-verification
description: Skill for querying ECHA SVHC database and parsing Safety Data Sheets (SDS) for chemical safety.
---

# REACH SVHC Chemical Safety Verification

## Overview
REACH Regulation (EC) No 1907/2006 requires suppliers to notify buyers and consumers when articles contain Substances of Very High Concern (SVHC) above 0.1% weight by weight (w/w). EUshop must enforce SVHC disclosure for non-food chemical articles before listing.

// COMPLIANCE-REVIEW: The ECHA Candidate List is updated twice yearly. Subscribe to ECHA updates and re-validate listings after each update.

## SVHC Candidate List

The ECHA Candidate List (as of 2024) contains 240+ substances. Key categories:

| Category | Examples |
|----------|---------|
| CMR substances | Bisphenol A, Lead compounds |
| vPvB (very persistent/bioaccumulative) | PFAS compounds |
| Endocrine disruptors | Phthalates (DEHP, DBP, BBP) |
| Respiratory sensitizers | Diisocyanates |

## SVHC Threshold Check

```typescript
// packages/compliance/src/reach.ts
const SVHC_THRESHOLD_PERCENT = 0.1; // w/w per article

export interface SvhcDeclaration {
  substanceName: string;
  ecNumber: string;         // E.g. '200-001-8' for bisphenol A
  casNumber: string;        // E.g. '80-05-7'
  concentrationPercent: number;  // Actual concentration in article
  isAboveThreshold: boolean;
  safeUseInstructions?: string;  // Required if above threshold
}

export function checkSvhcThreshold(
  declarations: SvhcDeclaration[]
): SvhcCheckResult {
  const flagged = declarations.filter(d => d.concentrationPercent > SVHC_THRESHOLD_PERCENT);
  return {
    requiresDisclosure: flagged.length > 0,
    flaggedSubstances: flagged,
    // COMPLIANCE-REVIEW: Consumer has right to request SVHC info within 45 days
  };
}
```

## ECHA Candidate List API Integration

```typescript
// packages/compliance/src/reach.ts
export async function lookupEchaCandidateList(ecNumber: string): Promise<EchaSubstance | null> {
  // ECHA CHEM API endpoint
  const url = `https://echa.europa.eu/api/substance?ec=${encodeURIComponent(ecNumber)}`;
  const response = await fetch(url);
  if (!response.ok) return null;
  return response.json() as Promise<EchaSubstance>;
  // COMPLIANCE-REVIEW: Cache results for 24h max; re-query after each Candidate List update
}
```

## Safety Data Sheet (SDS) Requirements

When a product is a chemical substance/mixture, sellers must provide:
1. SDS in the **official language** of each destination country
2. SDS in **16-section format** per REACH Annex II (amended by Reg. 2020/878)
3. SDS revision date and version number

## Platform Enforcement

```typescript
if (product.containsSvhc && svhcConcentration > SVHC_THRESHOLD_PERCENT) {
  // Mandatory disclosure block on product page
  product.svhcDisclosureRequired = true;
  product.svhcSubstances = flaggedSubstances;
  // Listing still permitted — but disclosure is mandatory
  // COMPLIANCE-REVIEW: Some national laws go further and may require withdrawal
}
```

## Consumer Rights

- Right to receive SVHC information **free of charge within 45 days** of request
- EUshop must provide a "Request chemical safety information" button for flagged products

## Source Files
- `packages/compliance/src/reach.ts`
- `packages/types/src/product.ts` — `SvhcDeclaration[]`
- `services/core-service/src/onboarding/ReachValidationService.java`
