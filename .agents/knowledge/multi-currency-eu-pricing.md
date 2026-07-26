# Multi-Currency EU Pricing Strategy

## Overview
EUshop operates in EUR as primary currency. Cross-border transactions may require currency conversion for non-eurozone EU buyers.

## Supported Currencies (EU Non-Eurozone)
| Country | Currency | ISO Code |
|---------|----------|----------|
| Denmark | Danish Krone | DKK |
| Sweden | Swedish Krona | SEK |
| Poland | Polish Złoty | PLN |
| Czech Republic | Czech Koruna | CZK |
| Hungary | Hungarian Forint | HUF |
| Romania | Romanian Leu | RON |
| Bulgaria | Bulgarian Lev | BGN |

## ECB Rate Integration
```typescript
// packages/compliance/src/currency.ts
const ECB_RATES_URL = 'https://data-api.ecb.europa.eu/service/data/EXR/D.USD+DKK+SEK+PLN+CZK+HUF+RON+BGN.EUR.SP00.A';

export async function getEcbRates(): Promise<Record<string, number>> {
  // Cache 24h — rates update once daily
  return cachedFetch(ECB_RATES_URL, { cacheTtl: 86400 });
}
```

## Display Rules
- All prices displayed in EUR as primary
- Local currency shown as secondary: "€12.50 (approx. PLN 52.30)"
- "approx." qualifier REQUIRED — never present as exact rate
- VAT included prices only (EU standard)

// COMPLIANCE-REVIEW: Verify currency display requirements with legal — some jurisdictions require local currency primary
