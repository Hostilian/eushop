# EU VAT Rates & OSS Threshold Reference

## Overview
EUshop uses the VAT Mini One Stop Shop (OSS) for cross-border EU sales. Single source of truth: `packages/compliance/src/vat.ts`.

## OSS Threshold
€10,000 combined cross-border B2C digital/goods sales per year.
- Below threshold: Use seller's home country VAT rate
- Above threshold: Use buyer's country VAT rate → register for OSS

## Key VAT Rates (verify against primary sources — rates change!)
| Country | Standard | Reduced |
|---------|----------|---------|
| DE | 19% | 7% |
| FR | 20% | 5.5% / 10% |
| IT | 22% | 10% / 5% |
| ES | 21% | 10% |
| PL | 23% | 8% / 5% |
| NL | 21% | 9% |

## Source of Truth
`packages/compliance/src/vat.ts` — NEVER copy rates to client code.

## Food VAT Treatment
Most EU countries apply reduced rates to unprocessed food. Verify per-country before applying.

// COMPLIANCE-REVIEW: Verify all rates against official EU VAT database before use in production
