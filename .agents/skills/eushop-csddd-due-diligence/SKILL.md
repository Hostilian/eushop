---
name: eushop-csddd-due-diligence
description: Skill for evaluating supplier environmental and human rights risk scores and due diligence filings.
---

# EU Corporate Sustainability Due Diligence (CSDDD — Directive 2024/1760)

## Overview
Directive 2024/1760 (CSDDD) requires large companies to identify, prevent, mitigate, and account for adverse human rights and environmental impacts in their own operations and across their supply chain (upstream and downstream). EUshop must implement a structured due diligence process for its highest-risk supplier relationships and marketplace seller categories.

// COMPLIANCE-REVIEW: CSDDD applies in phases by company size from 2027. EUshop may not yet meet the threshold. Verify with legal counsel. Implementing anyway shows good governance.

## Applicability Thresholds

| Phase | Applicable From | Threshold |
|-------|---------------|----------|
| Phase 1 | 26 July 2027 | >5,000 employees AND >€1.5bn turnover |
| Phase 2 | 26 July 2028 | >3,000 employees AND >€900m turnover |
| Phase 3 | 26 July 2029 | >1,000 employees AND >€450m turnover |

> Note: CSDDD also applies to non-EU companies with significant EU revenue. // COMPLIANCE-REVIEW

## Supplier Risk Scoring

```typescript
// packages/compliance/src/csddd.ts
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SupplierDueDiligenceRecord {
  supplierId: string;
  supplierName: string;
  countryOfOperation: string;
  productCategories: string[];
  humanRightsRiskLevel: RiskLevel;
  environmentalRiskLevel: RiskLevel;
  lastAssessmentDate: Date;
  nextAssessmentDue: Date;
  remediationActions?: RemediationAction[];
  grievancesSubmitted: number;
  // COMPLIANCE-REVIEW: Risk levels must be based on documented assessment methodology
}

export function calculateOverallRiskLevel(
  humanRightsRisk: RiskLevel,
  environmentalRisk: RiskLevel
): RiskLevel {
  const rankMap: Record<RiskLevel, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const maxRank = Math.max(rankMap[humanRightsRisk], rankMap[environmentalRisk]);
  return (Object.entries(rankMap).find(([, v]) => v === maxRank)?.[0] as RiskLevel) ?? 'LOW';
}
```

## High-Risk Country & Sector Flags

```typescript
// packages/compliance/src/csddd.ts
// Based on OECD, ILO, and EU Commission guidance
// COMPLIANCE-REVIEW: Update annually against latest OECD country risk assessments
export const HIGH_RISK_SECTORS = [
  'GARMENTS_TEXTILES',
  'ELECTRONICS_MINING',
  'AGRICULTURAL_COMMODITIES',
  'LEATHER_GOODS',
  'COCOA_COFFEE',
  'MINERALS_3TG',
] as const;

export const HIGH_RISK_COUNTRIES_ISO2 = [
  'CD', 'MM', 'AF', 'SO', 'SD',
  // COMPLIANCE-REVIEW: Full list from EU Commission risk assessment guidance
] as const;
```

## Due Diligence Obligations (Art. 5-11)

```typescript
export interface DueDiligencePlan {
  // Art. 5 — Due diligence policy
  dueDiligencePolicyUrl: string;
  lastPolicyUpdateDate: Date;

  // Art. 6 — Mapping and risk assessment
  supplyChainMappingComplete: boolean;
  riskAssessmentMethodologyUrl: string;

  // Art. 7 — Prevention
  contractualAssurancesInPlace: boolean;
  preventionActionPlan?: string;

  // Art. 8 — Bringing actual adverse impacts to an end
  remediationProcedureUrl: string;

  // Art. 9 — Grievance mechanism
  grievanceMechanismUrl: string;        // Must be accessible to stakeholders
  grievanceMechanismOperational: boolean;

  // Art. 11 — Climate change mitigation plan (Paris aligned)
  climateTransitionPlanUrl?: string;
  // COMPLIANCE-REVIEW: Climate plan is mandatory only for companies in scope
}
```

## Grievance Mechanism Requirements

- Must be accessible online, in all languages of operating territories
- Must allow anonymous submissions
- Complaints must be acknowledged within 15 business days
- Resolution or escalation within 3 months

## Annual Due Diligence Statement

```typescript
// Annual public disclosure required (Art. 16)
export interface AnnualDueDiligenceStatement {
  year: number;
  companyName: string;
  supplierCoverage: number;          // % of upstream partners assessed
  adverseImpactsIdentified: number;
  adverseImpactsRemediated: number;
  grievancesReceived: number;
  grievancesResolved: number;
  // Published on company website and filed with national supervisory authority
}
```

## Source Files
- `packages/compliance/src/csddd.ts`
- `services/core-service/src/supplier/DueDiligenceService.java`
- `services/core-service/src/reporting/CsdddAnnualStatementService.java`
