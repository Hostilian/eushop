# EUshop V243 — Risk Registry & Mitigation Strategies

---

## Risk Registry

| Risk ID | Category | Risk Description | Severity | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **RISK-01** | Security | Unverified third-party key harvesting workflows | **CRITICAL** | **P0 Neutralization**: Disabled `harvest_keys.yml`, added `.gitignore` rules, and instituted automated secret scanning (`check-secrets.ps1`). |
| **RISK-02** | Compliance | Unverified legal/compliance claims in UI or docs | **HIGH** | Explicit `// COMPLIANCE-REVIEW:` annotations on regulatory code and legal sign-off gates prior to production launch. |
| **RISK-03** | Logistics | Perishable food spoilage during cross-border EU shipping | **HIGH** | `ShippingProfile` classification (`AMBIENT`, `CHILLED`, `FROZEN`) and transit time limit validation in `multi-seller-cart.ts`. |
| **RISK-04** | Build | Static export breaking due to dynamic SSR routes | **MEDIUM** | Enforced static export pre-rendering audit in CI (`pnpm --filter web build` must complete 100% clean). |
