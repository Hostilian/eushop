# EUshop YC Optimization Task Queue & Roadmap

## PHASE 10 — Navigation, UX & Cart Reliability
Status: COMPLETED

- [x] TASK 25 — Reusable Breadcrumb component & route hierarchy
- [x] TASK 26 — End-to-end cart persistence & checkout route verification
- [x] TASK 27 — Allergen filter query parameter parsing in catalog service

## PHASE 11 — Legal Compliance Deep Dive
Status: COMPLETED

- [x] TASK 28 — GDPR cookie consent banner audit (CookieBanner.tsx)
- [x] TASK 29 — Impressum / Legal Notice page (impressum.tsx)
- [x] TASK 30 — Privacy Policy completeness audit (privacy.tsx)
- [x] TASK 31 — Terms of Service completeness audit (terms.tsx)
- [x] TASK 32 — PCI DSS / payment security audit (checkout.tsx Stripe iFrame integration)
- [x] TASK 33 — DSA Art. 30 "Sold by [Seller Name]" persistent UI element audit (ProductCard.tsx & food/[id].tsx)
- [x] TASK 34 — GPSR compliance fields for non-food products (packages/types & food/[id].tsx)

## PHASE 12 — Product Listings & Content Quality
Status: COMPLETED

- [x] TASK 35 — FIC Art. 9 mandatory food disclosure UI verification
- [x] TASK 36 — High-resolution product image gallery with fallback support
- [x] TASK 37 — Search filter facets for dietary restrictions & thermal packaging
- [x] TASK 38 — PDO / PGI / TSG quality scheme verification badge UI

## PHASE 13 — SEO & Technical Performance
Status: COMPLETED

- [x] TASK 39 — Schema.org JSON-LD structured data for Product & BreadcrumbList
- [x] TASK 40 — OpenGraph & Twitter card meta tags for all product & category pages
- [x] TASK 41 — Dynamic sitemap.xml & robots.txt generator
- [x] TASK 42 — Core Web Vitals image optimization with Next.js Image component
- [x] TASK 43 — Dynamic route pre-rendering & ISR caching strategy
- [x] TASK 44 — WCAG 2.2 AA color contrast audit across light/dark themes

## PHASE 14 — Accessibility (WCAG 2.2 AA)
Status: COMPLETED

- [x] TASK 45 — Screen reader aria-labels on interactive elements
- [x] TASK 46 — Keyboard navigation focus traps & skip-to-content link
- [x] TASK 47 — Accessible error state announcements in forms
- [x] TASK 48 — High-contrast mode styling for text elements

## PHASE 15 — Design, YC Principles & Conversion Optimisation
Status: COMPLETED

- [x] TASK 49 — Micro-animations & hover states for interactive components
- [x] TASK 50 — One-click checkout & guest checkout conversion flow
- [x] TASK 51 — Seller onboarding conversion funnel polish
- [x] TASK 52 — Trust signals & EU consumer protection badges
- [x] TASK 53 — Mobile-responsive layout optimization across viewports

## PHASE 16 — Automated Testing & CI/CD
Status: COMPLETED

- [x] TASK 54 — Comprehensive Jest unit test coverage for new components
- [x] TASK 55 — Playwright / Cypress E2E user flow tests
- [x] TASK 56 — ESLint & TypeScript strict mode validation in CI
- [x] TASK 57 — GitHub Actions automated build & test workflow

## PHASE 17 — VAT Engine & DAC7 Wiring (Phase 2 Compliance)
Status: COMPLETED

- [x] TASK 58 — Connect packages/compliance VAT engine to checkout totals
- [x] TASK 59 — DAC7 seller revenue threshold reporting cron job
- [x] TASK 60 — DSA Art. 32 buyer notification query implementation

## PHASE 18 — CHANGELOG & Documentation
Status: COMPLETED

- [x] TASK 61 — Update CHANGELOG.md with Phase 11 & Phase 12 completion entries
- [x] TASK 62 — Finalize AGENTS.md Phase progress roadmap & legal compliance disclosures

## DEPENDENCY MAP
- PHASE 10 must complete before PHASE 13 (SEO needs working nav)
- PHASE 11 must complete before PHASE 16 (tests need legal pages to exist)
- PHASE 12 must complete before PHASE 13 (SEO needs products)
- PHASE 14 must complete before PHASE 15 (a11y before design polish)
- PHASE 17 must read packages/compliance (must NOT duplicate VAT rates)