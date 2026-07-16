# EUshop — Data Flow & Compliance Architecture

> Generated as part of Phase 2 compliance deliverables.
> COMPLIANCE-REVIEW: This diagram must be reviewed by a DPO before any
> compliance claim is made about data handling. It reflects the intended
> architecture, not a certified audit.

---

## System Architecture

```mermaid
graph TD
    subgraph Clients
        WEB["Next.js Web (Port 3002)\nGitHub Pages static export"]
        MOB["Expo Mobile App\nAndroid APK / iOS TestFlight"]
    end

    subgraph EUshop Backend
        BE["Spring Boot Core Service (Port 3001)\nModular Monolith"]
        DB[("PostgreSQL\nOrders · Users · Foods · DAC7")]
        CACHE[("Redis\nSpring Session")]
    end

    subgraph Third Parties
        STRIPE["Stripe Connect\nPayments · KYC/KYB · Payouts"]
        AUTH0["Auth0\nJWT · RBAC · MFA"]
        GA["Google Analytics 4\nAnonymised usage"]
    end

    subgraph Government
        TAX["EU Tax Authorities\nDAC7 Annual Report (Jan 31)"]
        DSA_REG["DSA National Coordinator\nSeller verification records"]
    end

    WEB -->|REST + Cookie Auth| BE
    MOB -->|REST + JWT| BE
    WEB -->|Stripe Elements\nCard data never touches EUshop| STRIPE
    BE -->|JPA / pg_trgm| DB
    BE -->|Spring Session| CACHE
    BE -->|Webhook signature verification| STRIPE
    BE -->|RS256 JWT verification| AUTH0
    WEB -->|Anonymised events\nConsent-gated| GA
    BE -->|Annual DAC7 XML report| TAX
    BE -->|KYBC verification data| DSA_REG

    style WEB fill:#e8f5e9,stroke:#2e7d32
    style MOB fill:#e8f5e9,stroke:#2e7d32
    style BE fill:#e3f2fd,stroke:#1565c0
    style DB fill:#fff3e0,stroke:#e65100
    style CACHE fill:#fff3e0,stroke:#e65100
    style STRIPE fill:#f3e5f5,stroke:#6a1b9a
    style AUTH0 fill:#f3e5f5,stroke:#6a1b9a
    style GA fill:#fce4ec,stroke:#880e4f
    style TAX fill:#ffebee,stroke:#b71c1c
    style DSA_REG fill:#ffebee,stroke:#b71c1c
```

---

## Personal Data Flow

```mermaid
flowchart LR
    U[User] -->|Name, email, address| REG[Registration\nAuth0 + EUshop DB]
    U -->|Card details| STRIPE_E[Stripe Elements\nCard data → Stripe only\nNever touches EUshop]
    U -->|Cookie preferences| CONSENT[Consent Log\nHashed IP + UA only]

    S[Seller] -->|Legal name, address, phone, email\nID document ref\nTrade register number\nVAT number, TIN\nIBAN/BIC\nSelf-certification| KYBC[KYBC Onboarding\nDSA Art. 30 + DAC7]

    REG -->|User profile| DB_U[(users table)]
    KYBC -->|Seller verification| DB_S[(sellers table)]
    STRIPE_E -->|Payment intent| DB_O[(orders table)]
    CONSENT -->|Consent record| DB_C[(consent_log table)]

    DB_S -->|Annual report\nif >30 tx OR >€2,000| TAX[EU Tax Authorities\nDAC7 Jan 31]
    DB_U -->|Art. 17 erasure request| ANON[Anonymise PII\nRetain order records\nfor tax audit]
    DB_U -->|Art. 20 portability request| EXPORT[JSON export\nDownloaded by user]

    style STRIPE_E fill:#f3e5f5,stroke:#6a1b9a
    style TAX fill:#ffebee,stroke:#b71c1c
    style ANON fill:#e8f5e9,stroke:#2e7d32
    style EXPORT fill:#e8f5e9,stroke:#2e7d32
```

---

## Compliance Code Paths

```mermaid
flowchart TD
    LISTING[Seller creates listing] --> KYC_CHECK{kycVerified\n= true?}
    KYC_CHECK -->|No| BLOCK[Block listing\nDSA Art. 30]
    KYC_CHECK -->|Yes| ALLERGEN_CHECK{All 14 allergens\ndeclared?}
    ALLERGEN_CHECK -->|No| BLOCK2[Block listing\nEU Reg. 1169/2011]
    ALLERGEN_CHECK -->|Yes| LIVE[Listing goes live\nwith FIC Art.14 block]

    PURCHASE[Buyer adds to cart] --> VAT_CALC[Calculate VAT\ngetFoodVatRate\ndestination country]
    VAT_CALC --> OSS_CHECK{Seller annual\nEU sales > €10,000?}
    OSS_CHECK -->|No| HOME_VAT[Apply seller\nhome-country VAT]
    OSS_CHECK -->|Yes| DEST_VAT[Apply buyer\ndestination VAT\nOSS reporting]

    ORDER[Order completed] --> DAC7_COUNTER[Increment seller\ntransaction counter]
    DAC7_COUNTER --> DAC7_CHECK{>30 tx OR\n>€2,000?}
    DAC7_CHECK -->|Yes| REPORTABLE[Mark seller\nreportable\nInclude in Jan 31 report]
    DAC7_CHECK -->|No| NOT_REPORTABLE[Excluded from\nDAC7 report]

    style BLOCK fill:#ffebee,stroke:#b71c1c
    style BLOCK2 fill:#ffebee,stroke:#b71c1c
    style LIVE fill:#e8f5e9,stroke:#2e7d32
    style REPORTABLE fill:#fff3e0,stroke:#e65100
```

---

## Deployment Architecture

```mermaid
graph LR
    DEV[Developer\npush to main] -->|GitHub Actions CI| CI[CI Pipeline\nlint → compliance tests\n→ build → accessibility\n→ security → deploy]
    CI -->|Static export| GHP[GitHub Pages\nhostilian.github.io/eushop]
    GHP -->|CDN| USER[EU User]
    USER -->|Checkout| STRIPE[Stripe Connect]
    USER -->|Auth| AUTH0[Auth0]
    CI -->|Compliance test failure| BLOCK_DEPLOY[❌ Deploy blocked\nVAT/DAC7/allergen\ntest must pass]

    style BLOCK_DEPLOY fill:#ffebee,stroke:#b71c1c
    style CI fill:#e3f2fd,stroke:#1565c0
    style GHP fill:#e8f5e9,stroke:#2e7d32
```

---

## Incident Response Runbook

### Scenario 1: Incorrect VAT rate shipped to production

1. **Detect:** Compliance engine alert fires (VAT calculation returns unexpected value)
2. **Assess:** Check `packages/compliance/src/vat.ts` — which country rate is wrong?
3. **Contain:** Use feature flag to disable checkout for affected destination country
4. **Fix:** Update `EU_FOOD_VAT_RATES` with correct rate, add fixture test
5. **Verify:** Run `pnpm --filter @eushop/compliance test` — all tests must pass
6. **Deploy:** Merge fix, CI compliance tests gate the deploy
7. **Notify:** If orders were charged the wrong VAT, notify affected buyers and issue corrections
8. **Post-mortem:** Document in CHANGELOG.md

### Scenario 2: Seller DSA verification data found to be fraudulent

1. **Detect:** Admin report or authority notification
2. **Contain:** Set `kycVerified = false` and `suspensionStatus = 'suspended'` immediately (DSA requires swift action)
3. **Notify buyers:** Query orders from the preceding 6 months (DSA Art. 32 obligation)
4. **Preserve evidence:** Do not delete seller data — retain for legal proceedings
5. **Report:** Notify DSA national coordinator if required
6. **Post-mortem:** Review KYBC verification process

### Scenario 3: GDPR erasure request

1. Receive request at privacy@eushop.com
2. Verify identity of requester
3. Run `UserService.anonymizeUser(userId)` — anonymises PII, retains anonymised order records
4. Request deletion from Stripe (payment data) and Auth0 (credentials)
5. Confirm deletion in writing within 30 days
6. Log in ROPA

---

## Pre-Launch Legal Sign-Off Checklist

> **Human-only — no coding agent should mark these as done.**

- [ ] Lawyer confirms Privacy Policy, Cookie Policy, Terms, Refund Policy for each launch jurisdiction
- [ ] Tax advisor confirms VAT/OSS/IOSS registration and SME-scheme eligibility
- [ ] DAC7 registration/reporting-jurisdiction confirmed
- [ ] DSA obligations tier confirmed with national digital-services coordinator
- [ ] DPO sign-off on ROPA/DPIA (especially allergy-data special-category question)
- [ ] Explicit legal sign-off before any biometric processing is built
- [ ] Insurance/liability review for DSA safe-harbor posture
- [ ] PCI-DSS SAQ A self-assessment completed and confirmed
