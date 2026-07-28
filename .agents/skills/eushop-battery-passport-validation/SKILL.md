---
name: eushop-battery-passport-validation
description: Skill for parsing Digital Battery Passports, verifying QR codes, and checking recycled metal targets.
---

# EU Battery Regulation (2023/1542) — Digital Battery Passport

## Overview
EU Battery Regulation 2023/1542 requires Digital Battery Passports (DBP) for industrial batteries >2 kWh, EV batteries, and LMT batteries. EUshop sellers listing applicable batteries must upload verified DBP data. Carbon footprint performance classes and recycled content declarations must be validated before listing.

// COMPLIANCE-REVIEW: DBP requirements are being phased in. Verify current mandatory dates per battery category with Regulation Art. 77 schedules.

## Battery Categories in Scope

| Category | DBP Required From | Carbon Footprint Label | Recycled Content Label |
|----------|-----------------|----------------------|----------------------|
| EV batteries | 18 Feb 2027 | Yes | Yes |
| Industrial batteries >2kWh | 18 Feb 2027 | Yes | Yes |
| LMT (Light Means of Transport) | 18 Aug 2024 | Yes | Phase-in |
| Portable batteries | 18 Feb 2027 | Planned | Planned |

## Digital Battery Passport Schema

```typescript
// packages/types/src/product.ts
export interface DigitalBatteryPassport {
  batteryId: string;                    // Unique identifier (barcode/QR-linked)
  batteryModel: string;
  manufacturerName: string;
  manufacturerAddress: string;

  // Carbon footprint (Art. 7)
  carbonFootprintKgCO2ePerKwh: number;
  carbonFootprintClass: 'A' | 'B' | 'C' | 'D';
  carbonFootprintStudyUrl: string;      // Link to supporting lifecycle assessment

  // Recycled content (Art. 8)
  recycledContent: RecycledContentRecord;

  // State of health (Art. 14 — EV/industrial)
  stateOfHealthPercent?: number;        // 0–100

  // QR code
  qrCodeUrl: string;                    // Must link to machine-readable DBP data
  qrCodeFormat: 'QR_CODE_ISO_18004';

  // COMPLIANCE-REVIEW: DBP must be accessible via the EU Battery Passport Hub when operational
}

export interface RecycledContentRecord {
  cobaltPercent: number;    // Target: ≥16% from 2031
  leadPercent: number;      // Target: ≥85% from 2031
  lithiumPercent: number;   // Target: ≥6% from 2031
  nickelPercent: number;    // Target: ≥6% from 2031
}
```

## Recycled Content Minimum Targets

```typescript
// packages/compliance/src/battery.ts
// COMPLIANCE-REVIEW: Targets apply from 2031 for first phase, 2036 for second phase
export const RECYCLED_CONTENT_TARGETS_2031 = {
  cobalt: 16,     // %
  lead: 85,       // %
  lithium: 6,     // %
  nickel: 6,      // %
} as const;

export function validateRecycledContent(
  content: RecycledContentRecord,
  referenceYear: number
): ValidationResult {
  if (referenceYear < 2031) {
    // No mandatory minimum before 2031 — but disclosure is required
    return { valid: true, errors: [], warnings: ['Recycled content not yet mandatory — display only'] };
  }

  const errors: string[] = [];
  const targets = RECYCLED_CONTENT_TARGETS_2031;

  if (content.cobaltPercent < targets.cobalt)
    errors.push(`Cobalt recycled content ${content.cobaltPercent}% below minimum ${targets.cobalt}%`);
  if (content.leadPercent < targets.lead)
    errors.push(`Lead recycled content ${content.leadPercent}% below minimum ${targets.lead}%`);
  if (content.lithiumPercent < targets.lithium)
    errors.push(`Lithium recycled content ${content.lithiumPercent}% below minimum ${targets.lithium}%`);
  if (content.nickelPercent < targets.nickel)
    errors.push(`Nickel recycled content ${content.nickelPercent}% below minimum ${targets.nickel}%`);

  return { valid: errors.length === 0, errors };
}
```

## QR Code Validation

```typescript
// packages/compliance/src/battery.ts
export function validateBatteryQrCode(qrCodeUrl: string): boolean {
  // Must be a resolvable URL pointing to machine-readable DBP data
  // COMPLIANCE-REVIEW: EU Battery Passport Hub URL format TBC pending EC implementing acts
  try {
    const url = new URL(qrCodeUrl);
    return url.protocol === 'https:'; // Must be HTTPS
  } catch {
    return false;
  }
}
```

## Carbon Footprint Performance Class Display

```tsx
// apps/web/components/product/BatteryCarbonBadge.tsx
export function BatteryCarbonBadge({ carbonClass }: { carbonClass: 'A' | 'B' | 'C' | 'D' }) {
  const colours = { A: '#00a651', B: '#9dc13a', C: '#ffd700', D: '#f26d21' };
  return (
    <div
      className="battery-carbon-badge"
      style={{ backgroundColor: colours[carbonClass] }}
      aria-label={`Battery carbon footprint performance class ${carbonClass}`}
    >
      {carbonClass}
    </div>
  );
}
```

## Source Files
- `packages/compliance/src/battery.ts`
- `packages/types/src/product.ts` — `DigitalBatteryPassport`
- `apps/web/components/product/BatteryCarbonBadge.tsx`
- `services/core-service/src/onboarding/BatteryPassportValidationService.java`
