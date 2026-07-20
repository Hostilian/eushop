# EUshop YC-Optimization Master Task Queue
# Generated: 2026-07-20 | Source: YC-standard autonomous optimization brief
# Agents: FCC (Claude Code via fcc-work) + Hermes
# Rules: graceful degradation always on; never touch main; checkpoint after every task

---

## PHASE 10 — Navigation, UX & Cart Reliability
Status: COMPLETED

- [x] TASK 25 — Audit & fix hierarchical navigation flow
  File: apps/web/components/layout/Navbar.tsx
  Goal: Verify breadcrumb trails exist on all product pages; add missing ones.
  Acceptance: Breadcrumb renders on /products/[id] and /category/[slug]; no broken links.

- [x] TASK 26 — End-to-end cart workflow smoke test + fix
  File: apps/web/pages/cart.tsx, apps/web/lib/cart-store.ts
  Goal: Trace add-to-cart, persist on reload, proceed to checkout; fix broken state transitions.
  Acceptance: Add item, persist on reload, proceed to checkout without JS error.

- [x] TASK 27 — Search bar accuracy & result quality
  File: apps/web/components/layout/SearchBar.tsx (or equivalent)
  Goal: Ensure search returns products matching query; no empty-state crash.
  Acceptance: Searching a known product slug returns >=1 result; empty query shows all.

---

## PHASE 11 — Legal Compliance Deep Dive
Status: READY

- [/] TASK 28 — GDPR cookie consent banner audit
  Goal: Implement pre-consent blocking of analytics/tracking cookies per ePrivacy Directive.
  Acceptance: Analytics script does NOT load until explicit "Accept" click. Banner visible on first visit.
  // COMPLIANCE-REVIEW: Must be verified by qualified lawyer before production.

- [x] TASK 29 — Impressum / Legal Notice page (German/EU law requirement)
  File: apps/web/pages/impressum.tsx (create if missing)
  Goal: Add statutorily required Impressum with company name, address, registration number, VAT ID placeholder, responsible person, contact.
  Acceptance: /impressum route renders; footer links to it persistently.
  // COMPLIANCE-REVIEW: Actual company data must be filled by legal counsel.

- [ ] TASK 30 — Privacy Policy completeness audit
  File: apps/web/pages/privacy.tsx or legal/privacy-policy.md
  Goal: Verify policy covers data controller identity, processing purposes, legal basis (GDPR Art. 6), data subject rights (Art. 15-22), retention periods, third-party processors, cookie usage.
  Acceptance: All 7 GDPR Art. 13 disclosure points present in document.
  // COMPLIANCE-REVIEW: Must be reviewed by qualified lawyer.

- [ ] TASK 31 — Terms of Service completeness audit
  File: apps/web/pages/terms.tsx or legal/terms-of-service.md
  Goal: Ensure ToS covers payment terms, shipping policy, returns/refunds (EU Consumer Rights Directive 14-day rule), dispute resolution, liability limits.
  Acceptance: 14-day withdrawal right explicitly stated; returns process described.
  // COMPLIANCE-REVIEW: Lawyer review required before activation.

- [ ] TASK 32 — PCI DSS / payment security audit
  File: apps/web/pages/checkout.tsx, apps/web/components/checkout/
  Goal: Verify no raw card data handled client-side; Stripe/payment iFrame used exclusively.
  Acceptance: No card number input exists outside payment provider iFrame; CSP headers set on checkout page.
  // COMPLIANCE-REVIEW: Full PCI DSS SAQ required before live payments.

- [ ] TASK 33 — DSA Art. 30 "Sold by [Seller Name]" persistent UI element audit
  File: apps/web/components/product/ProductCard.tsx
  Goal: Confirm "Sold by" is non-decorative, always visible, not behind tooltip/hover.
  Acceptance: Seller name renders in DOM without hover/click; screen reader accessible.

- [ ] TASK 34 — GPSR compliance fields for non-food products
  File: packages/types/src/product.ts, apps/web/pages/products/[id].tsx
  Goal: Add GPSR-required fields (manufacturer name, address, safety contact) to non-food product schema.
  Acceptance: Product schema has gpsr field; UI renders it conditionally for non-food items.
  // COMPLIANCE-REVIEW: GPSR scope confirmation required.

---

## PHASE 12 — Product Listings & Content Quality
Status: READY

- [ ] TASK 35 — Product description completeness audit
  File: apps/web/data/demo-products.ts, packages/types/src/product.ts
  Goal: Ensure every product has name, description >=50 words, price, origin country, seller name, high-quality image URL.
  Acceptance: All demo products pass schema validation with no empty required fields.

- [ ] TASK 36 — Allergen display completeness on food products
  File: apps/web/components/product/AllergenDisplay.tsx, packages/compliance/src/allergens.ts
  Goal: Verify all 14 EU-regulated allergens are checkable; products with allergen data show them prominently.
  Acceptance: AllergenDisplay renders all 14 allergen categories; food products show present allergens in bold.

- [ ] TASK 37 — Product image audit & resilient fallbacks
  File: apps/web/components/ui/ProductImage.tsx
  Goal: Ensure all product images have alt text; broken image URLs fall back to branded placeholder.
  Acceptance: No <img> without alt; broken URL shows branded placeholder (not broken icon).

- [ ] TASK 38 — Customer review / testimonial section
  File: apps/web/components/product/ReviewSection.tsx (create if missing)
  Goal: Add static realistic customer reviews to product pages for trust signals.
  Acceptance: At least 3 reviews visible on a demo product page; star rating displayed.

---

## PHASE 13 — SEO & Technical Performance
Status: READY

- [ ] TASK 39 — Meta tags audit & fix (title, description, OG tags)
  File: apps/web/pages/_app.tsx, apps/web/pages/index.tsx, apps/web/components/layout/Head.tsx
  Goal: Every page must have unique <title> and <meta description>; index page has og:image.
  Acceptance: No two pages share the same <title>; description <=160 chars on all pages.

- [ ] TASK 40 — Structured data / schema.org markup for products
  File: apps/web/components/product/ProductSchema.tsx (create if missing)
  Goal: Add JSON-LD Product schema on product pages (name, price, availability, seller).
  Acceptance: JSON-LD present in <head> on /products/[id] with valid @type Product.

- [ ] TASK 41 — Sitemap.xml generation & robots.txt
  File: apps/web/public/sitemap.xml, apps/web/public/robots.txt
  Goal: Generate sitemap with all static routes; robots.txt allows crawlers.
  Acceptance: /sitemap.xml returns valid XML with >=5 URLs; /robots.txt not blocking Googlebot.

- [ ] TASK 42 — Breadcrumb schema markup
  File: apps/web/components/layout/Breadcrumb.tsx
  Goal: Wrap breadcrumb trail in BreadcrumbList JSON-LD schema.
  Acceptance: BreadcrumbList JSON-LD present on category/product pages.

- [ ] TASK 43 — Core Web Vitals & performance audit
  File: apps/web/next.config.js, apps/web/components/
  Goal: Ensure images use next/image (lazy loading); no render-blocking scripts.
  Acceptance: next/image used on all product images; no synchronous <script> in <head>.

- [ ] TASK 44 — Internal links audit (no broken links on GitHub Pages)
  File: apps/web/pages/, apps/web/components/layout/
  Goal: All internal hrefs use relative paths compatible with GitHub Pages base path.
  Acceptance: No absolute http:// internal links; next/link used throughout.

---

## PHASE 14 — Accessibility (WCAG 2.2 AA)
Status: READY

- [ ] TASK 45 — Keyboard navigation audit
  File: apps/web/components/layout/Navbar.tsx, apps/web/components/ui/
  Goal: All interactive elements reachable by Tab; no keyboard traps.
  Acceptance: Tab order logical on homepage and product page; modal closeable by Escape.

- [ ] TASK 46 — Colour contrast audit
  File: apps/web/public/v7/styles.css, apps/web/styles/
  Goal: All text/background combinations meet WCAG 2.2 AA 4.5:1 ratio for normal text.
  Acceptance: No text below 4.5:1 contrast on primary UI colours.

- [ ] TASK 47 — Skip-to-main-content link
  File: apps/web/components/layout/Layout.tsx
  Goal: Add visually-hidden skip link as first focusable element.
  Acceptance: <a href="#main-content"> present; becomes visible on focus.

- [ ] TASK 48 — Video captions audit
  File: apps/web/ (search for <video> tags)
  Goal: Any <video> element has <track kind="captions"> or is replaced with captioned embed.
  Acceptance: No bare <video> without captions; or no videos found (document finding).

---

## PHASE 15 — Design, YC Principles & Conversion Optimisation
Status: READY

- [ ] TASK 49 — Homepage 5-second clarity test
  File: apps/web/pages/index.tsx
  Goal: Above-fold must answer: What is it? Who is it for? What do I do next?
  Acceptance: Hero has headline (<=12 words), sub-headline (<=25 words), primary CTA with id="hero-cta".

- [ ] TASK 50 — Remove conversion-killing distractions from homepage
  File: apps/web/pages/index.tsx, apps/web/components/layout/
  Goal: Remove/hide elements that compete with primary action (register / browse products).
  Acceptance: Homepage has <=2 distinct CTAs above fold; no autoplay audio.

- [ ] TASK 51 — Trust signals section
  File: apps/web/pages/index.tsx or apps/web/components/home/TrustSignals.tsx
  Goal: Add trust bar with seller count, product count, EU compliance badge, GDPR badge.
  Acceptance: Section renders with at least 3 quantified trust signals.

- [ ] TASK 52 — Mobile responsiveness audit
  File: apps/web/styles/, apps/web/components/
  Goal: All pages render correctly at 375px viewport width; no horizontal scroll.
  Acceptance: No overflow-x on any page at 375px; hamburger menu functional.

- [ ] TASK 53 — YC-style problem/solution narrative on homepage
  File: apps/web/pages/index.tsx
  Goal: Add "Problem to Solution to Why now" narrative section per YC pitch guidelines.
  Acceptance: Three distinct sections identifiable as problem, solution, traction.

---

## PHASE 16 — Automated Testing & CI/CD
Status: READY

- [ ] TASK 54 — E2E smoke test: homepage loads
  File: apps/web/__tests__/ or cypress/e2e/
  Goal: Automated test visits / and asserts hero CTA is visible.
  Acceptance: Test passes in CI; fails gracefully if test runner unavailable.

- [ ] TASK 55 — E2E smoke test: product page loads
  File: apps/web/__tests__/
  Goal: Test visits /products/[demo-id] and asserts product name, price, seller visible.
  Acceptance: Test passes in CI.

- [ ] TASK 56 — E2E smoke test: cart add/remove
  File: apps/web/__tests__/
  Goal: Test adds item to cart and asserts cart count increments.
  Acceptance: Test passes in CI.

- [ ] TASK 57 — GitHub Actions: run tests on every PR
  File: .github/workflows/
  Goal: CI runs tests on push to non-main branches.
  Acceptance: Workflow file present; uses existing test script; passes on current codebase.

---

## PHASE 17 — VAT Engine & DAC7 Wiring (Phase 2 Compliance)
Status: READY

- [ ] TASK 58 — Wire VAT engine to displayed product prices
  File: apps/web/components/product/PriceDisplay.tsx, packages/compliance/src/vat.ts
  Goal: Show VAT-inclusive price using compliance package; show "inc. VAT" label.
  Acceptance: Price renders as "EUR X.XX inc. VAT"; VAT rate sourced from packages/compliance only.
  // COMPLIANCE-REVIEW: VAT rates must be verified by tax advisor before live sales.

- [ ] TASK 59 — DAC7 threshold warning in seller dashboard
  File: apps/web/pages/seller/dashboard.tsx (create stub if missing)
  Goal: Show warning when seller approaches DAC7 thresholds (30 txn OR EUR 2,000).
  Acceptance: Warning banner visible in seller dashboard when mock data crosses threshold.
  // COMPLIANCE-REVIEW: DAC7 reporting obligations require legal verification.

- [ ] TASK 60 — OSS threshold indicator
  File: apps/web/pages/seller/dashboard.tsx
  Goal: Show cross-border sales total vs EUR 10,000 OSS threshold.
  Acceptance: Progress indicator present; warns at 80% of threshold.
  // COMPLIANCE-REVIEW: OSS registration obligations vary by jurisdiction.

---

## PHASE 18 — CHANGELOG & Documentation
Status: READY

- [ ] TASK 61 — Update CHANGELOG.md with all Phase 10-17 work
  File: CHANGELOG.md
  Goal: Add entries for every task completed in phases 10-17.
  Acceptance: CHANGELOG.md has [Unreleased] section with dated entries for every completed task.

- [ ] TASK 62 — Update STATUS.md with current phase and open blockers
  File: STATUS.md
  Goal: Reflect current phase, all completed tasks, remaining tasks, compliance blockers.
  Acceptance: STATUS.md updated within the same commit as task completions.

---

## DEPENDENCY MAP
- PHASE 10 must complete before PHASE 13 (SEO needs working nav)
- PHASE 11 must complete before PHASE 16 (tests need legal pages to exist)
- PHASE 12 must complete before PHASE 13 (SEO needs products)
- PHASE 14 must complete before PHASE 15 (a11y before design polish)
- PHASE 17 must read packages/compliance (must NOT duplicate VAT rates)

## AGENT INSTRUCTIONS
- Read this file at the start of each invocation.
- Pick the first [ ] task that is not BLOCKED.
- Mark in-progress as [/], completed as [x], failed twice as [!].
- Write a one-line summary to .hermes/version-44-journal.md after each task.
- Record failures in .hermes/version-44-failures.md.
- Never mark a task [x] unless acceptance criteria are verifiably met.
- All compliance tasks MUST include // COMPLIANCE-REVIEW: comment in generated code.
- Commit after completing each full PHASE (not individual tasks).
- Keep main untouched. Never force-push. Never expose secrets.
