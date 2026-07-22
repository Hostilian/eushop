# EUshop YC Optimization Task Queue & Roadmap

## PHASE 10 —€ Navigation, UX & Cart Reliability
Status: COMPLETED

- [x] TASK 25 —€ Reusable Breadcrumb component & route hierarchy
- [x] TASK 26 —€ End-to-end cart persistence & checkout route verification
- [x] TASK 27 —€ Allergen filter query parameter parsing in catalog service

## PHASE 11 —€ Legal Compliance Deep Dive
Status: COMPLETED

- [x] TASK 28 —€ GDPR cookie consent banner audit (CookieBanner.tsx)
- [x] TASK 29 —€ Impressum / Legal Notice page (impressum.tsx)
- [x] TASK 30 —€ Privacy Policy completeness audit (privacy.tsx)
- [x] TASK 31 —€ Terms of Service completeness audit (terms.tsx)
- [x] TASK 32 —€ PCI DSS / payment security audit (checkout.tsx Stripe iFrame integration)
- [x] TASK 33 —€ DSA Art. 30 "Sold by [Seller Name]" persistent UI element audit (ProductCard.tsx & food/[id].tsx)
- [x] TASK 34 —€ GPSR compliance fields for non-food products (packages/types & food/[id].tsx)

## PHASE 12 —€ Product Listings & Content Quality
Status: COMPLETED

- [x] TASK 35 —€ FIC Art. 9 mandatory food disclosure UI verification
- [x] TASK 36 —€ High-resolution product image gallery with fallback support
- [x] TASK 37 —€ Search filter facets for dietary restrictions & thermal packaging
- [x] TASK 38 —€ PDO / PGI / TSG quality scheme verification badge UI

## PHASE 13 —€ SEO & Technical Performance
Status: COMPLETED

- [x] TASK 39 —€ Schema.org JSON-LD structured data for Product & BreadcrumbList
- [x] TASK 40 —€ OpenGraph & Twitter card meta tags for all product & category pages
- [x] TASK 41 —€ Dynamic sitemap.xml & robots.txt generator
- [x] TASK 42 —€ Core Web Vitals image optimization with Next.js Image component
- [x] TASK 43 —€ Dynamic route pre-rendering & ISR caching strategy
- [x] TASK 44 —€ WCAG 2.2 AA color contrast audit across light/dark themes

## PHASE 14 —€ Accessibility (WCAG 2.2 AA)
Status: COMPLETED

- [x] TASK 45 —€ Screen reader aria-labels on interactive elements
- [x] TASK 46 —€ Keyboard navigation focus traps & skip-to-content link
- [x] TASK 47 —€ Accessible error state announcements in forms
- [x] TASK 48 —€ High-contrast mode styling for text elements

## PHASE 15 —€ Design, YC Principles & Conversion Optimisation
Status: COMPLETED

- [x] TASK 49 —€ Micro-animations & hover states for interactive components
- [x] TASK 50 —€ One-click checkout & guest checkout conversion flow
- [x] TASK 51 —€ Seller onboarding conversion funnel polish
- [x] TASK 52 —€ Trust signals & EU consumer protection badges
- [x] TASK 53 —€ Mobile-responsive layout optimization across viewports

## PHASE 16 —€ Automated Testing & CI/CD
Status: COMPLETED

- [x] TASK 54 —€ Comprehensive Jest unit test coverage for new components
- [x] TASK 55 —€ Playwright / Cypress E2E user flow tests
- [x] TASK 56 —€ ESLint & TypeScript strict mode validation in CI
- [x] TASK 57 —€ GitHub Actions automated build & test workflow

## PHASE 17 —€ VAT Engine & DAC7 Wiring (Phase 2 Compliance)
Status: COMPLETED

- [x] TASK 58 —€ Connect packages/compliance VAT engine to checkout totals
- [x] TASK 59 —€ DAC7 seller revenue threshold reporting cron job
- [x] TASK 60 —€ DSA Art. 32 buyer notification query implementation

## PHASE 18 —€ CHANGELOG & Documentation
Status: COMPLETED

- [x] TASK 61 —€ Update CHANGELOG.md with Phase 11 & Phase 12 completion entries
- [x] TASK 62 —€ Finalize AGENTS.md Phase progress roadmap & legal compliance disclosures

## PHASE 19 —€ Advanced Multilingual & i18n Localization Engine
Status: COMPLETED

- [x] TASK 63 —€ Dynamic locale switcher (EN, DE, FR, IT, ES, CS) with RTL/LTR layout support
- [x] TASK 64 —€ Allergen name multi-language translation engine in packages/compliance
- [x] TASK 65 —€ Currency auto-conversion & display formatting per EU member state locale
- [x] TASK 66 —€ Localized statutory withdrawal forms & EU consumer rights PDF generation
- [x] TASK 67 —€ Localized error messages and accessible form validation strings
- [x] TASK 68 —€ Automatic EU region-based tax notice & shipping threshold calculation display
- [x] TASK 69 —€ Multilingual SEO meta tags & hreflang link tags for all product routes
- [x] TASK 70 —€ Cross-border seller verification document translation guidance UI

## PHASE 20 —€ AI Vision, Allergen Scanner & OCR Pipeline
Status: COMPLETED

- [x] TASK 71 —€ Vision AI food label scanner integration (scripts/scan_food_label.py API endpoint)
- [x] TASK 72 —€ Real-time camera ingredient list OCR for seller product onboarding
- [x] TASK 73 —€ Automated Annex II 14 allergen extraction & auto-flagging engine
- [x] TASK 74 —€ Nutrition declaration table auto-parsing from raw label images
- [x] TASK 75 —€ Automated PDO / PGI official certificate OCR verification scanner
- [x] TASK 76 —€ FIC Art. 15 language compliance checker for destination country markets
- [x] TASK 77 —€ Automatic allergen highlight & warning label generator component
- [x] TASK 78 —€ End-to-end integration tests for Vision AI & OCR pipeline

## PHASE 21 —€ Real-Time Chat, Seller Messaging & DSA Dispute System
Status: IN_PROGRESS

- [x] TASK 79 —€ DSA Art. 20 Internal Complaint-Handling & Dispute Resolution portal
- [x] TASK 80 —€ Real-time buyer-seller WebSocket messaging with end-to-end audit trail
- [x] TASK 81 —€ Seller response time SLA tracking & DSA compliance badge assignment
- [x] TASK 82 —€ Automated buyer dispute escalation for unfulfilled cross-border shipments
- [x] TASK 83 —€ File attachment virus scanning and PDF validation service for chat
- [x] TASK 84 —€ Message reaction & read receipt synchronization across web & mobile
- [x] TASK 85 —€ DSA Art. 16 Notice-and-Action illegal content reporting workflow
- [x] TASK 86 —€ Automated notification digest emails for seller customer inquiries

## PHASE 22 —€ Mobile (Expo / React Native) Feature Parity & Native Capabilities
- [x] TASK 79 —€  DSA Art. 20 Internal Complaint-Handling & Dispute Resolution portal
- [x] TASK 80 —€  Real-time buyer-seller WebSocket messaging with end-to-end audit trail
- [x] TASK 81 —€  Seller response time SLA tracking & DSA compliance badge assignment
- [x] TASK 82 —€  Automated buyer dispute escalation for unfulfilled cross-border shipments
- [x] TASK 83 —€  File attachment virus scanning and PDF validation service for chat
- [x] TASK 84 —€  Message reaction & read receipt synchronization across web & mobile
- [x] TASK 85 —€  DSA Art. 16 Notice-and-Action illegal content reporting workflow
- [x] TASK 86 —€  Automated notification digest emails for seller customer inquiries

## PHASE 22 —€  Mobile (Expo / React Native) Feature Parity & Native Capabilities
Status: READY

- [x] TASK 87 —€  React Native Expo allergen filter drawer and search screen parity
- [!] TASK 88 —€  Native biometric checkout authentication (TouchID/FaceID) with consent gate
- [x] TASK 89 —€  Offline product listing storage and background sync using AsyncStore
- [x] TASK 90 —€  Native push notifications for order status and seller dispute updates
- [x] TASK 91 —€  Mobile camera barcode & QR code product lookup scanner
        // COMPLIANCE-REVIEW: Implementing barcode scanner requires ensuring that any product data fetched through this feature complies with EU regulations, including but not limited to data protection and consumer rights.
- [x] TASK 92 —€  Haptic feedback on cart actions and order confirmation screens
- [x] TASK 93 —€  Expo dark mode & high-contrast theme synchronization with device settings

## PHASE 23 —€  Advanced Microservices, Spring Boot Backend & DB Hardening
Status: READY

Status: READY

- [ ] TASK 111 —€  Penetration testing & OWASP Top 10 security audit suite
- [x] TASK 112 —€  Content Security Policy (CSP) & CORS header hardening across routes
- [ ] TASK 113 —€  Automated dependency vulnerability scanning (Snyk & Dependabot)
- [x] TASK 114 —€  GDPR Art. 30 Records of Processing Activities (ROPA) automated exporter
- [x] TASK 115 —€  Key vault integration & automated API key rotation daemon
- [ ] TASK 116 —€  Zero-trust network policy & TLS 1.3 enforcement
- [ ] TASK 117 —€  ISO 27001 & SOC 2 compliance readiness documentation
- [ ] TASK 118 —€  Automated end-to-end chaos engineering & failover validation suite

## DEPENDENCY MAP
- PHASE 10 must complete before PHASE 13 (SEO needs working nav)
- PHASE 11 must complete before PHASE 16 (tests need legal pages to exist)
- PHASE 12 must complete before PHASE 13 (SEO needs products)
- PHASE 14 must complete before PHASE 15 (a11y before design polish)
- PHASE 17 must read packages/compliance (must NOT duplicate VAT rates)
- PHASE 19 & 20 feed into PHASE 22 (mobile needs i18n & vision AI)
- PHASE 21 feeds into PHASE 23 (chat needs backend microservices & DB)

<!-- VERSION55_QUEUE_BEGIN -->

# VERSION 55 MASTER PRIORITY OVERRIDE

Status: READY
Target release: Version 55
Target branch: version-55
Priority: Version 55 security, public reliability, compliance and evidence gates outrank remaining cosmetic or speculative work.

Transition rule:

- Preserve all current uncommitted work.
- If one coherent task is actively being edited, finish or safely checkpoint that atomic task first.
- Then create or resume `version-55` and begin TASK 119.
- Do not reset, clean, discard, force-push, merge directly into `main` or deploy.
- The Windows sidebar tasks are supporting observability work and must not displace security or public reliability.
- Critical and High security findings outrank visual polish and investor presentation.

## PHASE 26 - Version 55 Branch Safety, Evidence Baseline and Mission State
Status: COMPLETED

- [x] TASK 119 - Safely create or resume the `version-55` branch, inventory branches, tags, worktrees, remotes, pull requests and uncommitted work, record the starting SHA and preserve recoverable backups without destructive Git commands
- [x] TASK 120 - Create `docs/version-55/` and `.agent-state/version-55/`, install the canonical Version 55 mission, and initialize evidence-backed baseline, decision, research, test, failure, heartbeat and resume state
- [x] TASK 121 - Read canonical repository instructions and build a claim-to-evidence matrix for README, STATUS, SECURITY, compliance documents and major feature claims, classifying verified, partial, mocked, stale, contradicted, external, legal-review and missing states
- [x] TASK 122 - Inventory the actual architecture and run documented baseline commands for frontend, backend, migrations, Docker, E2E, accessibility, dependency, secret and CodeQL checks; record commands, timestamps, exit status and remediation tasks

### Phase 26 Definition of Done

- Existing user and agent work is preserved
- `version-55` has a known safe baseline
- Canonical Version 55 files and machine-readable state exist
- Baseline failures and unsupported claims are documented with evidence
- No task is marked complete solely because compilation succeeds

## PHASE 27 - Version 55 Security Emergency and CodeQL Remediation
Status: COMPLETED

- [x] TASK 123 - Trace all 18 supplied CodeQL findings end to end, confirm source-to-sink behavior, identify sibling vulnerabilities and create regression tests or reproducible evidence before changing alert status
- [x] TASK 124 - Repair DAC7 user-controlled numeric casts and arithmetic using typed DTOs, boundary validation, BigDecimal monetary handling, explicit scale and rounding, bounded counts, checked arithmetic and structured validation errors
- [x] TASK 125 - Repair FileStorageService path injection with one normalized storage root, server-generated identifiers, strict extension and MIME validation, containment checks, size limits, safe deletion and traversal, symlink and junction tests
- [x] TASK 126 - Determine the real browser credential model and implement correct CSRF behavior, secure cookie or bearer-token separation, narrowly justified webhook exemptions and positive and negative mutation tests
- [x] TASK 127 - Remove client-controlled authentication bypasses in AuthController and JwtAuthenticationFilter; enforce cryptographic verification, issuer, audience, algorithm and time-claim validation, fail-closed behavior and production-safe development profiles
- [x] TASK 128 - Resolve useless controller parameters by removing genuinely dead API inputs or wiring authentication, ownership, pagination, filtering and route binding correctly; add object-level authorization tests for sibling endpoints
- [x] TASK 129 - Complete the security gate: configure CodeQL for Java and JavaScript or TypeScript, include the Java build, run security-extended analysis where practical, triage dependencies and secrets, harden Actions permissions and pin third-party actions
- [x] TASK 130 - Perform an independent OWASP ASVS Level 2 attacker review covering authentication, authorization, IDOR or BOLA, path traversal, upload abuse, CSRF, CORS, JWT confusion, injection, XSS, rate limits, webhook forgery, payment tampering and secret exposure

### Phase 27 Definition of Done

- No supplied Critical or High finding remains reproducible without rigorous documented justification
- Security regression tests fail against the original vulnerable behavior where practical
- CodeQL analyzes the actual Java and JavaScript or TypeScript code
- Authentication and authorization fail closed
- No security check is weakened merely to produce a green dashboard

## PHASE 28 - Public Experience and GitHub Pages Reliability
Status: COMPLETED

- [x] TASK 131 - Stabilize homepage, navigation, marketplace, product pages, legal pages, login and seller onboarding under the real `/eushop/` base path, including nested-route refreshes and static export
- [x] TASK 132 - Repair basePath, assetPrefix, router, image, manifest, canonical, Open Graph, hydration, environment, import and static-export failures and eliminate blank screens and infinite loading states
- [x] TASK 133 - Implement deterministic, truthfully labelled demo fallback data that appears only when backend APIs are unavailable and is isolated from production transaction logic
- [x] TASK 134 - Add public-journey smoke and E2E tests for browsing, search, filters, sorting, pagination, product details, mobile layout, empty states, invalid routes, loading termination and external links

## PHASE 29 - Marketplace Product Completeness
Status: IN_PROGRESS

- [x] TASK 135 - Complete and verify the buyer journey from discovery through cart, server-authoritative checkout, order history, cancellation, refund, dispute, delivery confirmation, verified review, notifications and support
- [ ] TASK 136 - Complete and verify seller onboarding, identity and business verification, tax and payment onboarding, compliant listings, secure image upload, inventory, pricing, shipping, order handling, refunds, suspension, DAC7 state and appeals
- [x] TASK 137 - Implement or harden operator workflows for seller approval, listing and food-information moderation, disputes, refunds, fraud signals, legal notices, data requests, erasure, exports, DAC7 exceptions and privileged audit logs
- [ ] TASK 138 - Enforce strong authorization and object ownership across buyer, seller, support and administrator operations; do not expose an inadequately protected public administrator surface

## PHASE 30 - EU Compliance Structure
Status: P1

- [ ] TASK 139 - Enforce required food information before publication, including ingredients, regulated allergen structure and emphasis, net quantity, storage, operator identity, origin, nutrition, language and distance-selling presentation
- [ ] TASK 140 - Implement and test DSA trader traceability, reasonable verification structure, notice and action, statements of reasons, complaint and appeal processes, illegal-product response, moderation records and recommender transparency where applicable
- [ ] TASK 141 - Verify and harden DAC7 seller classification, identity and tax data, transaction counts, precise consideration and fee totals, reporting periods, corrections, due diligence, access control, audit history, secure export and retention
- [ ] TASK 142 - Implement testable GDPR inventory, lawful-basis mapping, minimization, consent separation, retention, access, correction, portability, restriction, objection, deletion or anonymization, cookie choices, analytics gating and breach-response structure
- [ ] TASK 143 - Verify consumer-protection controls for trader identity, total price, tax and shipping disclosure, order-button wording, cancellation and perishable-goods exceptions, refunds, complaint handling, review authenticity and dark-pattern avoidance
- [ ] TASK 144 - Centralize versioned VAT and OSS rules, precise currency calculations, evidence and effective dates, refunds and adjustments, invoice questions and explicit legal or tax review gates without claiming professional approval

## PHASE 31 - Payment, Database and Operational Integrity
Status: P1

- [ ] TASK 145 - Make all payment totals server authoritative and test price, seller and quantity tampering, stale prices, stock races, webhook authenticity and idempotency, ordering, retries, refunds, currency, commission and tax rounding
- [ ] TASK 146 - Validate fresh and supported database migrations, constraints, foreign keys, unique rules, monetary precision, timestamps, PII classification, audit protection, upgrade paths and forward-repair or rollback procedures
- [ ] TASK 147 - Measure and improve real query plans for search, filters, seller dashboard, orders, conversations, notifications, DAC7, moderation and reporting without blind optimization
- [ ] TASK 148 - Implement failure-safe timeouts, bounded retries, idempotency, connection and request limits, pagination, rate limits, health and readiness checks, graceful shutdown, structured sanitized logs, correlation IDs and recovery tests

## PHASE 32 - Test Strategy, CI/CD and Supply-Chain Security
Status: P1

- [ ] TASK 149 - Build focused unit and backend integration coverage for compliance and price calculations, validation, authorization, path handling, controllers, transactions, migrations, webhooks, error behavior and important concurrency
- [ ] TASK 150 - Build frontend and E2E coverage for rendering, forms, auth state, search, filters, fallback behavior, accessibility, base-path links, seller listing, secure upload, cart, test-mode checkout, webhook, orders, reviews and privacy workflows
- [ ] TASK 151 - Build dedicated security tests for CodeQL regressions, authorization matrices, path traversal, malicious upload, CSRF, JWT negatives, rate limiting, headers, CORS, injection, log sanitization, error leakage and object-level access
- [ ] TASK 152 - Harden all GitHub Actions with least privilege, immutable action pinning, deterministic installs, safe caching, frontend and backend separation, CodeQL coverage, dependency review, artifact retention, scan schedules and untrusted-PR secret isolation
- [ ] TASK 153 - Record flaky and quarantined tests with cause, owner and expiry, prevent weakened assertions, and publish exact command, result, timestamp, evidence and commit data for every Version 55 verification run

## PHASE 33 - Accessibility, Design, Performance and Developer Experience
Status: P2

- [ ] TASK 154 - Reach WCAG 2.2 AA for public and core account flows, covering semantics, keyboard, focus, forms, errors, status announcements, modals, contrast, reduced motion, touch targets, zoom, screen-reader order and mobile layouts
- [ ] TASK 155 - Consolidate a trustworthy design system for typography, spacing, colors, forms, buttons, statuses, alerts, cards, skeletons, errors and responsive breakpoints while removing deceptive badges, dark patterns and unsupported claims
- [ ] TASK 156 - Measure and improve bundle, route, image, font, export, API, database, cache, memory, startup, test and CI performance, with failure tests for database, Redis, Auth0 or JWKS, Stripe, storage, slow APIs and offline frontend
- [ ] TASK 157 - Repair README and developer documentation for clean setup, environment variables, Docker, migrations, seeding, frontend and backend startup, tests, CodeQL, architecture, auth, compliance, payments, troubleshooting, rollback, incidents, backup and demos

## PHASE 34 - Investor and Y Combinator Readiness
Status: P2_AFTER_WORKING_PRODUCT

- [ ] TASK 158 - Produce a truthful, repeatable demo environment and script explaining the focused customer problem, seller difficulty, product workflow, trust model, transaction path, current proof, assumptions, pilot plan and measurable milestones
- [ ] TASK 159 - Produce evidence-backed architecture, security and compliance overviews, roadmap, risk register, milestone plan, metric definitions, data-room index, diligence checklist, known limitations, operational plan and incident summary
- [ ] TASK 160 - Label every metric and business assertion as actual, measured, test data, assumption, target, forecast, unknown or requires validation; remove unsupported traction, certification, partnership or legal-readiness claims
- [ ] TASK 161 - Run separate attacker, hostile-user, investor-diligence and operator red-team passes and turn every credible finding into prioritized queue work
- [ ] TASK 162 - Enforce the complete Version 55 definition of done across repository integrity, security, product, compliance, engineering quality, reliability and investor readiness
- [ ] TASK 163 - Produce `docs/version-55/FINAL_REPORT.md` with starting and ending state, per-alert remediation evidence, product and compliance changes, verification table, Git history, remaining work and one truthful release verdict

## PHASE 35 - Supporting Agent Observability and Windows Sidebar
Status: P3_SUPPORTING_ONLY

- [ ] TASK 164 - Build a native Windows EUshop Progress Sidebar executable that docks to the right side, supports always-on-top mode, minimizes to the notification area and starts automatically with Windows
- [ ] TASK 165 - Implement a read-only evidence collector combining queue state, orchestrator and watchdog PID health, AI child processes, Git commits, Git working-tree changes, source-file timestamps and real agent logs
- [ ] TASK 166 - Display live completion percentage plus completed, active, pending and failed counts, with manual refresh and a two-minute default automatic refresh
- [ ] TASK 167 - Implement four-minute evidence-based health borders: green after meaningful activity within four minutes, red after more than four minutes without meaningful work or when the orchestrator is down, and warning during provider transitions
- [ ] TASK 168 - Distinguish WORKING, RUNNING, BETWEEN INVOCATIONS, POSSIBLY STALLED and DOWN without treating process existence, CPU use or repetitive watchdog messages alone as proof of useful progress
- [ ] TASK 169 - Package, test and document installation, Windows startup, repository selection, notifications, clean uninstall, offline behavior and smoke-test procedures

### Phase 35 Definition of Done

- Sidebar work never displaces or blocks P0 or P1 Version 55 tasks
- Monitoring is read-only and cannot reset, clean, commit, merge, push, deploy or edit repository source
- Default refresh is two minutes
- Green requires meaningful repository evidence within four minutes
- Red appears after more than four minutes without meaningful activity or when the orchestrator is down
- Monitor-generated history and repetitive watchdog lines do not count as coding progress

## PHASE 36 - v66 Ground Truth, Product Identity & Truth Inventory
Status: UPCOMING

- [x] TASK 170 - Build `docs/v66/00-ground-truth.md` repository inventory (commits, active packages, runtime ports, DB schema, CI workflows)
- [x] TASK 171 - Build `docs/v66/01-product-truth.md` reconciling specialty-food marketplace vs traveler mobility thesis
- [ ] TASK 172 - Repository boundaries cleanup (quarantine scraped sites, binary archives, temporary logs, stale sessions)
- [ ] TASK 173 - License, SBOM, and asset provenance reconciliation across dependencies and media files
- [x] TASK 174 - Create `docs/v66/V66_BACKLOG.md` with priority scoring engine `(Severity*5 + Value*4 + Sec*5 - Risk*2 - Effort*1)`

## PHASE 37 - v66 Zero-Critical Security Program & STRIDE Threat Model
Status: UPCOMING

- [ ] TASK 175 - Secret & suspicious automation containment, pre-commit prevention, and scanner rules
- [ ] TASK 176 - Complete CodeQL taint analysis across all numeric casts and path expressions repository-wide
- [ ] TASK 177 - Actor & role authorization matrix enforcement & CSRF/SameSite cookie session security
- [ ] TASK 178 - Centralized security headers, CSP, output encoding, and API rate limiting middleware
- [x] TASK 179 - Create `docs/security/THREAT_MODEL.md` (STRIDE framework across all 16 domain modules)
- [ ] TASK 180 - Supply-chain security, GitHub Action commit-SHA pinning, container scanning, and SBOM generation

## PHASE 38 - v66 CI/CD Pipeline Trustworthiness & Zero-Downtime Deployment
Status: UPCOMING

- [ ] TASK 181 - GitHub Actions CI failure matrix diagnosis and Maven wrapper execution permission stabilization
- [ ] TASK 182 - Separate PR verification pipeline from Pages static export & production runtime deployment
- [ ] TASK 183 - Enforce strict branch protection quality gates (zero `continue-on-error` on critical gates)
- [ ] TASK 184 - Establish zero-downtime deployment strategy with expand-contract migration prechecks
- [ ] TASK 185 - Automated Playwright E2E critical buyer/seller/admin journey test suite

## PHASE 39 - v66 Core Transaction Correctness & Money Precision
Status: UPCOMING

- [ ] TASK 186 - Currency-aware decimal value objects for monetary precision and strict rounding
- [ ] TASK 187 - Complete server-authoritative Stripe Connect state machine (idempotency, webhooks, signatures)
- [ ] TASK 188 - End-to-end buyer journey verification (discovery, cart, server checkout, order status, dispute, review)
- [ ] TASK 189 - Seller onboarding & KYBC verification gate, listing publication, inventory, DAC7 export
- [ ] TASK 190 - Admin & moderation journey (trader identity audit, notice-and-action, disputes, appeals)

## PHASE 40 - v66 Evolutionary Scale Architecture & PostGIS Spatial Integration
Status: UPCOMING

- [ ] TASK 191 - Modular monolith boundary enforcement with ArchUnit architecture tests across 16 domain modules
- [ ] TASK 192 - Flyway/Liquibase migration discipline with zero-downtime schema changes and rollback runbooks
- [ ] TASK 193 - PostgreSQL transactional outbox pattern for domain events before distributed broker scaling
- [ ] TASK 194 - PostGIS spatial integration (`geography(Point, 4326)`, GiST indexes, `ST_DWithin` corridor queries)
- [ ] TASK 195 - PostgreSQL full-text & trigram search benchmarking against OpenSearch/Elasticsearch
- [ ] TASK 196 - Stage-based target architecture (Stage 0 pre-seed to Stage 3 regional cell failover design)

## PHASE 41 - v66 Observability, Property Testing & YC Investor Package
Status: UPCOMING

- [ ] TASK 197 - OpenTelemetry distributed tracing across Next.js frontend, Spring Boot backend, and PostgreSQL
- [ ] TASK 198 - Prometheus metrics, Grafana dashboards, and structured JSON logging with correlation IDs
- [ ] TASK 199 - Create `docs/compliance/CONTROL_MATRIX.md` (GDPR, DSA, DAC7, ePrivacy, WCAG 2.2 AA)
- [ ] TASK 200 - Property-based testing for monetary calculations, VAT rules, and state machine transitions
- [ ] TASK 201 - Performance & load testing with k6/Gatling measuring query plans and N+1 bottlenecks
- [ ] TASK 202 - Create `docs/v66/YC_READINESS.md` with investor diligence package, unit economics, and data room index

<!-- VERSION66_QUEUE_END -->
