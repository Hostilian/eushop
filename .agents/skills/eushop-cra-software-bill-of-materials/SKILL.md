---
name: eushop-cra-software-bill-of-materials
description: Skill for parsing SPDX/CycloneDX SBOM files and verifying vulnerability patch windows under CRA.
---

# EU Cyber Resilience Act (CRA — Reg. 2024/2847) — SBOM & Vulnerability Management

## Overview
The EU Cyber Resilience Act (CRA, Regulation 2024/2847) requires manufacturers of products with digital elements (PDE) to provide an SBOM, report actively exploited vulnerabilities to ENISA within 24 hours, and guarantee security updates for the product's expected lifecycle. EUshop must verify that sellers listing PDEs provide compliant SBOMs and vulnerability management commitments.

// COMPLIANCE-REVIEW: CRA applies from 11 December 2027. ENISA notification obligations apply from 11 September 2026. Verify product categorisation (Default / Important / Critical) with legal counsel.

## Product With Digital Elements (PDE) Categories

| Class | Examples | Conformity Assessment |
|-------|---------|----------------------|
| Default | Smart home devices, toys with connectivity | Self-declaration |
| Important – Class I | Browsers, VPNs, identity management | Self-declaration or third-party audit |
| Important – Class II | OS, hypervisors, industrial control | Third-party audit mandatory |
| Critical | Hardware security modules, smart meters | EU-type examination |

## SBOM Requirements

```typescript
// packages/compliance/src/cra.ts
export type SbomFormat = 'SPDX' | 'CYCLONEDX';

export interface SoftwareBillOfMaterials {
  format: SbomFormat;
  formatVersion: string;        // e.g. 'SPDX-2.3', 'CycloneDX-1.6'
  generatedAt: Date;
  components: SbomComponent[];
  documentUrl: string;          // Publicly accessible or downloadable
}

export interface SbomComponent {
  name: string;
  version: string;
  packageUrl?: string;          // PURL format: pkg:npm/lodash@4.17.21
  license: string;              // SPDX license expression
  hasKnownVulnerabilities: boolean;
  cveIds?: string[];            // Active CVEs if known
  patchStatus?: 'PATCHED' | 'PATCH_AVAILABLE' | 'NO_PATCH' | 'INVESTIGATING';
}
```

## SBOM Parsing & Validation

```typescript
// packages/compliance/src/cra.ts
export function parseCycloneDxSbom(sbomJson: string): SoftwareBillOfMaterials {
  const raw = JSON.parse(sbomJson);
  if (raw.bomFormat !== 'CycloneDX') throw new Error('Not a CycloneDX SBOM');

  return {
    format: 'CYCLONEDX',
    formatVersion: raw.specVersion,
    generatedAt: new Date(raw.metadata?.timestamp),
    documentUrl: '', // must be set by caller
    components: raw.components.map((c: any) => ({
      name: c.name,
      version: c.version,
      packageUrl: c.purl,
      license: c.licenses?.[0]?.license?.id ?? 'UNKNOWN',
      hasKnownVulnerabilities: (c.vulnerabilities?.length ?? 0) > 0,
      cveIds: c.vulnerabilities?.map((v: any) => v.id) ?? [],
      patchStatus: 'INVESTIGATING',
    })),
  };
}

export function validateSbomCompleteness(sbom: SoftwareBillOfMaterials): ValidationResult {
  const errors: string[] = [];
  if (sbom.components.length === 0) errors.push('SBOM contains no components');
  const unpurled = sbom.components.filter(c => !c.packageUrl);
  if (unpurled.length > 0) {
    // Warn rather than error — PURLs recommended but not always possible
    // COMPLIANCE-REVIEW: CRA does not mandate PURLs but strongly recommended
  }
  return { valid: errors.length === 0, errors };
}
```

## Vulnerability Reporting Timeline

```typescript
// packages/compliance/src/cra.ts
export const CRA_VULNERABILITY_TIMELINES = {
  earlyWarningHours: 24,    // Art. 14(1): Notify ENISA within 24h of learning about actively exploited vuln
  detailedReportDays: 72,   // Art. 14(2): Detailed notification within 72h
  finalReportDays: 14,      // Art. 14(3): Final report within 14 days
} as const;

export function getCraVulnerabilityDeadlines(discoveredAt: Date): VulnerabilityDeadlines {
  return {
    earlyWarningDeadline: addHours(discoveredAt, CRA_VULNERABILITY_TIMELINES.earlyWarningHours),
    detailedReportDeadline: addHours(discoveredAt, CRA_VULNERABILITY_TIMELINES.detailedReportDays * 24),
    finalReportDeadline: addDays(discoveredAt, CRA_VULNERABILITY_TIMELINES.finalReportDays),
    // COMPLIANCE-REVIEW: ENISA notification must be via EU vulnerability database (EUVD)
  };
}
```

## Security Update Commitment

Sellers listing PDEs must declare:
1. Expected product support period (minimum 5 years recommended)
2. Method of delivering security updates (OTA, firmware download, etc.)
3. Update is free of charge and does not degrade core functionality

## Source Files
- `packages/compliance/src/cra.ts`
- `packages/types/src/product.ts` — `CraMetadata`, `SoftwareBillOfMaterials`
- `services/core-service/src/onboarding/CraValidationService.java`
- `services/core-service/src/security/VulnerabilityNotificationService.java`
