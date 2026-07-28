---
name: eushop-craft-gi-verification
description: Skill for verifying EUIPO Craft and Industrial Geographical Indication registrations and badge claims.
---

# EU Craft & Industrial GI Verification

## Overview
Regulation (EU) 2023/2411 created an EU-wide protection system for craft and industrial geographical indications (GIs). EUshop must verify that products claiming a craft or industrial GI badge are genuinely registered under the EUIPO register, and must never allow imitation names (e.g. "Limoges-style porcelain" for uncertified products).

// COMPLIANCE-REVIEW: This regulation entered into force in 2024. EUIPO registry population is ongoing. Re-verify against live register before enforcing a block.

## What Is Protected

| GI Type | Examples |
|---------|---------|
| Craft GI | Limoges porcelain, Solingen cutlery, Murano glass, Brussels lace |
| Industrial GI | Sheffield steel, Carrara marble tools |
| Traditional Art | Castelo Branco embroidery, Biella fabric |

## Name Misuse Prohibition

Prohibited expressions for non-certified products:
- "Murano glass-style" / "Murano-inspired"
- "Limoges porcelain design" (for uncertified products)
- Translations or paraphrases evoking a protected name
- Any indication that creates a false impression of origin

```typescript
// packages/compliance/src/gi.ts
export function detectGiNameMisuse(
  productName: string,
  productDescription: string,
  registeredGiNames: string[]
): GiMisuseResult {
  const text = `${productName} ${productDescription}`.toLowerCase();
  const matches: string[] = [];

  for (const giName of registeredGiNames) {
    const base = giName.toLowerCase();
    // Check exact match AND approximate evocations
    if (text.includes(base) || text.includes(`${base}-style`) || text.includes(`${base}-inspired`)) {
      matches.push(giName);
    }
  }

  return {
    hasMisuse: matches.length > 0,
    matchedGiNames: matches,
    // COMPLIANCE-REVIEW: "Evocation" is broadly interpreted — review flagged cases manually
  };
}
```

## EUIPO Craft GI Register Lookup

```typescript
// packages/compliance/src/gi.ts
export async function verifyEuipoCraftGi(
  productName: string,
  producerCode?: string
): Promise<EuipoGiVerification> {
  // EUIPO GI database endpoint (verify URL with EUIPO before production use)
  // COMPLIANCE-REVIEW: EUIPO craft GI API may not yet be publicly available; use manual verification
  const searchUrl = `https://euipo.europa.eu/copla/api/craftgi?name=${encodeURIComponent(productName)}`;
  const response = await fetch(searchUrl);
  if (!response.ok) {
    return { verified: false, reason: 'EUIPO lookup failed — manual review required' };
  }
  const data = await response.json();
  return {
    verified: data.registrationStatus === 'REGISTERED',
    registrationNumber: data.registrationNumber,
    productionArea: data.geographicArea,
    producerCode,
  };
}
```

## Badge Display Rules

- Only display the **EU Craft GI badge** when EUIPO verification returns `REGISTERED`
- Badge must link to EUIPO registration record
- Never display badge based on seller self-attestation alone
- Show placeholder "GI Pending Verification" state during review period

## Seller Onboarding Requirements

```typescript
if (product.hasCraftGiClaim) {
  const giCheck = await verifyEuipoCraftGi(product.craftGiName, seller.producerCode);
  if (!giCheck.verified) {
    product.craftGiBadge = 'PENDING_REVIEW';
    await notifyComplianceTeam(`GI claim requires manual review: ${product.craftGiName}`);
    // Do NOT block listing — allow with "Pending" badge pending review
    // COMPLIANCE-REVIEW: Consider mandatory hold period before displaying claim
  }
}
```

## Source Files
- `packages/compliance/src/gi.ts`
- `packages/types/src/product.ts` — `GiClaim`
- `apps/web/components/badges/GiBadge.tsx`
