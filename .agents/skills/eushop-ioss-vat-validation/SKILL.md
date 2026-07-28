---
name: eushop-ioss-vat-validation
description: Skill for checking IOSS VAT numbers via EU VIES and allocating destination VAT on low-value import sales.
---

# EU Import One-Stop Shop (IOSS) VAT Validation

## Overview
The Import One-Stop Shop (IOSS) scheme (effective July 2021) allows EUshop to collect and remit VAT at point of sale for imported goods ≤ €150 from non-EU countries. The IOSS number must be validated via EU VIES, printed on shipping labels, and destination-country VAT applied at the correct rate.

// COMPLIANCE-REVIEW: IOSS registration is per legal entity. If EUshop's IOSS registration lapses or is revoked, all low-value imports must switch to customs import VAT at border. Monitor IOSS registration status continuously.

## Key IOSS Rules

| Rule | Detail |
|------|--------|
| Threshold | ≤ €150 intrinsic goods value (excluding transport, insurance) |
| Who collects VAT | EUshop (as marketplace facilitator) — not the seller |
| VAT rate applied | Destination country standard or reduced rate |
| IOSS number on label | Required — must appear in customs data |
| Monthly OSS return | File by last day of month following taxable period |
| Payment deadline | Same as return deadline |

## IOSS VAT Calculation

```typescript
// packages/compliance/src/vat.ts
export const IOSS_CEILING_EUR = 150; // Single source of truth for IOSS threshold

export function calculateIossVat(
  goodsValueEUR: number,
  destinationCountryCode: string,
  productVatCategory: 'STANDARD' | 'REDUCED' | 'SUPER_REDUCED' | 'ZERO'
): IossVatResult {
  if (goodsValueEUR > IOSS_CEILING_EUR) {
    throw new Error('IOSS does not apply to goods above €150 — use standard import procedure');
  }

  const vatRate = getVatRate(destinationCountryCode, productVatCategory);
  // COMPLIANCE-REVIEW: Some goods (food, books) attract reduced rates in destination country
  return {
    goodsValue: goodsValueEUR,
    vatRate,
    vatAmount: goodsValueEUR * (vatRate / 100),
    totalCharge: goodsValueEUR * (1 + vatRate / 100),
    iossApplicable: true,
    destinationCountry: destinationCountryCode,
  };
}
```

## IOSS Number Validation via VIES

```typescript
// packages/compliance/src/vat.ts
// IOSS number format: IM + country code + 10-digit number (e.g. IMEU0123456789)
const IOSS_NUMBER_PATTERN = /^IM[A-Z]{2}\d{10}$/;

export async function validateIossNumber(iossNumber: string): Promise<IossValidation> {
  if (!IOSS_NUMBER_PATTERN.test(iossNumber)) {
    return { valid: false, reason: 'Invalid IOSS number format' };
  }

  // EU VIES SOAP/REST API — validate active registration
  // COMPLIANCE-REVIEW: VIES IOSS validation endpoint differs from standard VAT check
  // See: https://ec.europa.eu/taxation_customs/vies/
  const response = await fetch(
    `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/EU/vat/${iossNumber}`
  );
  const data = await response.json();

  return {
    valid: data.valid === true,
    countryCode: data.countryCode,
    vatNumber: data.vatNumber,
    // COMPLIANCE-REVIEW: Cache VIES response for max 24h; re-validate if cached result is stale
  };
}
```

## Shipping Label Requirements

```typescript
// services/core-service/src/shipping/IossLabelService.java-equivalent
export function buildShippingLabelData(order: Order, iossNumber: string): ShippingLabel {
  return {
    ...order.shippingAddress,
    iossNumber,           // Must appear in CN22/CN23 customs declaration field
    goodsValue: order.goodsValueEUR,
    currency: 'EUR',
    // COMPLIANCE-REVIEW: Carrier must transmit IOSS number in their customs data electronically
  };
}
```

## Monthly OSS Return Structure

```typescript
export interface OssReturn {
  taxPeriod: { year: number; month: number };
  filingDeadline: Date;                         // Last day of following month
  byCountry: OssCountryEntry[];
}

export interface OssCountryEntry {
  memberStateCode: string;
  vatRatePercent: number;
  taxableAmountEUR: number;
  vatAmountEUR: number;
  transactionCount: number;
}
```

## Source Files
- `packages/compliance/src/vat.ts` — `IOSS_CEILING_EUR`, `calculateIossVat()`
- `services/core-service/src/checkout/IossCheckoutService.java`
- `services/core-service/src/reporting/OssReturnService.java`
- `services/core-service/src/shipping/IossLabelService.java`
