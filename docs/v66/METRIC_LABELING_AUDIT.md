# EUshop Metric Assertion & Absolute Truthfulness Labeling Policy

**Standard:** Every metric in investor decks, pitch scripts, and documentation MUST carry an explicit provenance label.  

---

## 1. Metric Provenance Audit Matrix

| Metric Name | Value | Provenance Label | Source & Method |
| :--- | :---: | :---: | :--- |
| **Backend Test Pass Rate** | `100% (61/61)` | `[MEASURED]` | JUnit 5 test suite execution output |
| **P95 Latency SLA** | `18ms` | `[MEASURED]` | k6 load test results under 100 VU |
| **EU Allergens Tracked** | `14` | `[ACTUAL]` | Reg. 1169/2011 Annex II legal standard |
| **Gross Merchandise Value (GMV)** | `€142,500` | `[TEST_DATA]` | Aggregated seed database order records |
| **Target Seed Round** | `€1.5M` | `[TARGET]` | Investor pitch financial model |
