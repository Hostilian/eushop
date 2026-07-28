---
name: eushop-dst-tax-reporting
description: Skill for calculating marketplace commission revenue attributable to DST-levying EU member states.
---

# Digital Services Tax (DST) Reporting

## Overview
Several EU member states levy national Digital Services Taxes (DST) on marketplace intermediation revenue attributed to their territory. EUshop must separately track platform commission revenue by country to calculate and report DST liabilities where applicable.

// COMPLIANCE-REVIEW: DST rules, rates, and thresholds are set at national level and subject to change with OECD Pillar One finalisation. Verify rates and applicability with a qualified tax advisor.

## Countries with Active DST (as of 2024)

| Country | Rate | Revenue Threshold | Digital Services Revenue Threshold |
|---------|------|-----------------|----------------------------------|
| France | 3% | €750M global / €25M France | Yes |
| Spain | 3% | €750M global / €3M Spain | Yes |
| Italy | 3% | €750M global / €5.5M Italy | Yes |
| Austria | 5% | Global revenue applicable | Digital advertising only |
| Poland | 1.5% | Digital advertising | Advertising only |

> Note: Austria and Poland currently apply DST to digital advertising only — not marketplace intermediation. // COMPLIANCE-REVIEW

## Revenue Attribution Logic

```typescript
// packages/compliance/src/dst.ts
export interface DstRevenueRecord {
  orderId: string;
  buyerCountryCode: string;         // ISO-3166-2 country of buyer
  platformFeeEUR: number;           // EUshop's commission (not GMV)
  orderCompletedAt: Date;
  taxableUnderDst: boolean;         // Calculated per country rules
}

export function attributeDstRevenue(orders: DstRevenueRecord[]): DstSummary {
  const byCountry = new Map<string, number>();

  for (const order of orders) {
    if (!DST_COUNTRIES.includes(order.buyerCountryCode)) continue;
    const current = byCountry.get(order.buyerCountryCode) ?? 0;
    byCountry.set(order.buyerCountryCode, current + order.platformFeeEUR);
  }

  return {
    byCountry: Object.fromEntries(byCountry),
    totalTaxableRevenue: Array.from(byCountry.values()).reduce((a, b) => a + b, 0),
    // COMPLIANCE-REVIEW: Attribution method (buyer country vs. seller country) must be confirmed
  };
}
```

## DST Rate Application

```typescript
// packages/compliance/src/dst.ts
const DST_RATES: Record<string, number> = {
  FR: 0.03,  // 3%
  ES: 0.03,  // 3%
  IT: 0.03,  // 3%
  // COMPLIANCE-REVIEW: Update when OECD Pillar One agreement changes national DSTs
};

export function calculateDstLiability(
  countryCode: string,
  taxableRevenueEUR: number
): DstLiability {
  const rate = DST_RATES[countryCode] ?? 0;
  return {
    countryCode,
    taxableRevenue: taxableRevenueEUR,
    rate,
    dstAmount: taxableRevenueEUR * rate,
  };
}
```

## Quarterly DST Return Data

```typescript
// Scheduler: runs on first day of month following end of each quarter
export async function generateQuarterlyDstReturn(
  year: number,
  quarter: 1 | 2 | 3 | 4
): Promise<DstReturn> {
  const { startDate, endDate } = getQuarterDates(year, quarter);
  const orders = await orderRepository.findCompletedInPeriod(startDate, endDate);
  const revenueByCountry = attributeDstRevenue(
    orders.map(o => toDstRevenueRecord(o))
  );
  // COMPLIANCE-REVIEW: Filing deadlines and submission formats differ by country
  return { year, quarter, revenueByCountry, generatedAt: new Date() };
}
```

## Threshold Monitoring

- Log a compliance alert if France/Spain/Italy revenue attribution crosses 50% of national threshold
- DST only applies if EUshop meets **both** global AND national revenue thresholds
- Thresholds are assessed on calendar-year basis

## Source Files
- `packages/compliance/src/dst.ts`
- `services/core-service/src/reporting/DstReportingService.java`
- `services/core-service/src/scheduler/DstReturnCronJob.java`
