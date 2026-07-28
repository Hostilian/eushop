---
name: eushop-3tg-conflict-minerals-audit
description: Skill for evaluating RMI smelter lists and verifying OECD due diligence reports for 3TG metals.
---

# EU Conflict Minerals (3TG) Due Diligence — Reg. 2017/821

## Overview
Regulation (EU) 2017/821 requires EU importers of tin, tantalum, tungsten, and gold (3TG) originating from conflict-affected and high-risk areas (CAHRAs) to carry out OECD-aligned supply chain due diligence. EUshop may be subject to this regulation as a marketplace facilitating imports of electronics or jewellery from affected supply chains.

// COMPLIANCE-REVIEW: The regulation applies to importers above volume thresholds, not all marketplaces. Verify whether EUshop as facilitator has direct importer obligations or only facilitation obligations.

## 3TG Metals & Minimum Volume Thresholds

| Metal | Form | Threshold (net weight/year) |
|-------|------|---------------------------|
| Tin | Ore, concentrate, metal | 100 tonnes |
| Tantalum | Ore, concentrate, metal | 100 tonnes |
| Tungsten | Ore, concentrate, metal | 100 tonnes |
| Gold | Ore, concentrate, metal, dust | 100 kg |

```typescript
// packages/compliance/src/conflictMinerals.ts
export const CONFLICT_MINERALS_THRESHOLDS: Record<string, { amount: number; unit: string }> = {
  TIN: { amount: 100, unit: 'tonnes' },
  TANTALUM: { amount: 100, unit: 'tonnes' },
  TUNGSTEN: { amount: 100, unit: 'tonnes' },
  GOLD: { amount: 100, unit: 'kg' },
};
```

## Conflict-Affected and High-Risk Areas (CAHRAs)

```typescript
// packages/compliance/src/conflictMinerals.ts
// Based on European Commission CAHRA list
// COMPLIANCE-REVIEW: Update annually against EC CAHRA list publication
export const CAHRA_COUNTRIES_ISO2 = [
  'CD', // DRC (Congo) — primary concern
  'CF', // Central African Republic
  'SS', // South Sudan
  'SD', // Sudan
  'SO', // Somalia
  'MM', // Myanmar/Burma
  'AF', // Afghanistan
  // COMPLIANCE-REVIEW: Full list from EC delegated regulation
] as const;

export function isFromCahra(originCountryCode: string): boolean {
  return CAHRA_COUNTRIES_ISO2.includes(originCountryCode as any);
}
```

## RMI (Responsible Minerals Initiative) Smelter Verification

```typescript
// packages/compliance/src/conflictMinerals.ts
export interface SmelterRecord {
  smelterName: string;
  smelterCountry: string;
  metalType: '3TG_TIN' | '3TG_TANTALUM' | '3TG_TUNGSTEN' | '3TG_GOLD';
  rmiStatus: 'CONFORMANT' | 'ACTIVE' | 'OUTREACH' | 'SUSPENDED' | 'NOT_LISTED';
  rmiAuditDate?: Date;
}

export function verifySmelterRmiStatus(
  smelter: SmelterRecord
): SmelterVerificationResult {
  const isConformant = smelter.rmiStatus === 'CONFORMANT';
  return {
    conformant: isConformant,
    riskLevel: isConformant ? 'LOW' : 'HIGH',
    requiresAdditionalDueDiligence: !isConformant,
    // COMPLIANCE-REVIEW: RMI conformant list downloaded from responsiblemineralsinitiative.org
    // Cache for max 30 days before re-downloading
  };
}
```

## OECD Due Diligence Steps (5-Step Framework)

```typescript
// packages/compliance/src/conflictMinerals.ts
export interface OecdDueDiligenceRecord {
  // Step 1: Establish strong company management systems
  supplyChainPolicyUrl: string;
  internalControlsDocUrl: string;

  // Step 2: Identify and assess risks
  riskAssessmentDate: Date;
  riskAssessmentUrl: string;
  smeltersList: SmelterRecord[];

  // Step 3: Design and implement a strategy to respond to identified risks
  riskResponseStrategyUrl: string;

  // Step 4: Carry out independent third-party audit of smelter/refiner
  thirdPartyAuditRequired: boolean;
  thirdPartyAuditReportUrl?: string;

  // Step 5: Report annually on supply chain due diligence
  annualReportUrl: string;
  reportYear: number;
}
```

## Seller Disclosure Requirements

For products containing 3TG metals (electronics, jewellery, electrical equipment):
- Seller must disclose country of origin of 3TG minerals if known
- Smelter/refiner list must be provided if seller is the EU importer
- RMI conformant smelter status must be verifiable

## Source Files
- `packages/compliance/src/conflictMinerals.ts`
- `packages/types/src/product.ts` — `ConflictMineralsDeclaration`
- `services/core-service/src/onboarding/ConflictMineralsValidationService.java`
