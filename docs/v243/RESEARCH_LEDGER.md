# EUshop V243 — Research & Primary Source Regulatory Ledger

---

## Primary Regulatory Sources

### 1. Digital Services Act (DSA) — Regulation (EU) 2022/2065
- **Article 30 (Trader Traceability)**: Mandates collection and persistent display of trader name, address, trade register number, payment account details, and self-certification prior to consumer transactions.
- **Articles 16 & 20 (Notice & Action / Internal Redress)**: Mandates electronic mechanisms for reporting illegal content and internal complaint handling systems.
- **Evidence Implementation**: `TraderTraceabilityCard.tsx`, `moderation.tsx`, `dsa-trader-verifier.ts`.

### 2. Food Information to Consumers (FIC) — Regulation (EU) No 1169/2011
- **Article 21 (Allergen Indication)**: Mandatory display of 14 regulated allergens in contrasting typeface prior to distance selling checkout completion.
- **Evidence Implementation**: `@eushop/compliance` `allergens.ts`, `allergen-filter.tsx`.

### 3. DAC7 Tax Reporting Directive — Directive (EU) 2021/514
- **Thresholds**: Mandatory annual tax reporting for sellers exceeding 30 transactions OR €2,000 gross consideration per calendar year.
- **Evidence Implementation**: `Dac7Service.java`, `004_dac7_reporting.sql`.

### 4. Quality Schemes — Regulation (EU) No 1151/2012
- **PDO / PGI / TSG Rules**: Protection of geographical designations registered in European Commission eAmbrosia database.
- **Evidence Implementation**: `eambrosia-verifier.ts`, `atlas/index.tsx`.
