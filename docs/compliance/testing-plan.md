# EUshop — Testing Plan

---

## Test Priorities

> P0 tests must pass before any deploy to production.
> P1 tests must pass before public launch.
> P2 tests are ongoing quality improvements.

---

## P0 — Compliance Engine Tests (in CI, blocking)

These are the most important tests in the repo. A silently-failing VAT
calculation or wrong DAC7 threshold is worse than a visibly broken page.

Located in: `packages/compliance/src/__tests__/compliance.test.ts`

| Test case | Input | Expected output |
|---|---|---|
| DAC7: exactly 30 tx, €2,000 | (30, 2000) | `false` (excluded) |
| DAC7: 31 tx, €1,000 | (31, 1000) | `true` (reportable) |
| DAC7: 10 tx, €2,001 | (10, 2001) | `true` (reportable) |
| DAC7: 29 tx, €1,999 | (29, 1999) | `false` (excluded) |
| OSS: exactly €10,000 | 10000 | `false` (not required) |
| OSS: €10,001 | 10001 | `true` (required) |
| VAT: Germany (DE) | 'DE' | 0.07 |
| VAT: Ireland (IE) | 'IE' | 0.00 |
| VAT: Denmark (DK) | 'DK' | 0.25 |
| VAT: unknown country | 'XX' | 0.20 (conservative fallback) |
| VAT: case-insensitive | 'de' | 0.07 |
| Allergens: count | EU_ALLERGENS_14 | length === 14 |
| Allergens: no duplicates | EU_ALLERGENS_14 | Set size === 14 |
| Allergens: all 14 present | EU_ALLERGENS_14 | includes all Annex II items |

---

## P0 — Checkout Flow Tests

| Test case | Steps | Expected |
|---|---|---|
| Add to cart | Click "Add to cart" on product | Cart count increments, item in localStorage |
| Cart persists | Add item, reload page | Item still in cart |
| Checkout renders | Navigate to /checkout | Form renders, Stripe Elements loads |
| VAT label | View order summary | Shows "VAT (rate by destination country)" not "15%" |
| Empty cart checkout | Navigate to /checkout with empty cart | Submit button disabled |
| Terms required | Submit without accepting terms | Form does not submit |

---

## P0 — Allergen Filter Tests

| Test case | Steps | Expected |
|---|---|---|
| Filter by allergen | Select "Free from Milk" | Products containing Milk are excluded |
| Filter clears | Click "Clear Filters" | All products shown |
| Filter keyboard nav | Tab to allergen select, use arrow keys | Filter changes, results update |
| Allergen badge aria-label | Inspect AllergenBadge | aria-label="Contains allergen: [name]" present |
| No colour-only allergen | Inspect allergen display | Text label always present alongside icon |

---

## P1 — Seller Onboarding Tests

| Test case | Steps | Expected |
|---|---|---|
| Missing trade register | Submit without trade register number | Form validation error |
| Missing TIN | Submit without tax ID | Form validation error |
| Self-certification required | Submit without checking self-cert | Error: "You must self-certify" |
| Terms required | Submit without accepting terms | Error shown |
| Successful submission | Fill all fields, submit | Success message, user role updated |
| KYC status display | View seller dashboard | Shows amber circle (not green tick) if kycVerified=false |

---

## P1 — GDPR Tests

| Test case | Steps | Expected |
|---|---|---|
| Data export | Click "Download My Data" | JSON file downloaded |
| Export format | Inspect downloaded file | Valid JSON with userProfile and ordersList |
| Delete account | Confirm deletion | User redirected to home, localStorage cleared |
| Cookie consent | First visit | Banner shown |
| Cookie consent persists | Accept, reload | Banner not shown again |
| Cookie consent change | Change analytics preference | localStorage updated |
| Consent record | Change preference | authAPI.recordConsent called |

---

## P1 — Security Tests

| Test case | Tool | Expected |
|---|---|---|
| No secrets in source | grep / CI check | No `sk_live_`, `AUTH0_CLIENT_SECRET` in .ts/.tsx files |
| Dependency vulnerabilities | `pnpm audit` | No high/critical vulnerabilities |
| XSS in product name | Inject `<script>alert(1)</script>` as product name | Sanitized, not executed |
| Cart localStorage injection | Manually set malformed cart JSON | App handles gracefully, no crash |
| Stripe webhook signature | Send webhook without signature | Request rejected |

---

## P2 — Accessibility Manual Tests (WCAG 2.2 AA)

> Automated axe-core catches ~30-50% of real issues. Manual testing required.

### VoiceOver (macOS/iOS) — checkout flow
- [ ] All form labels announced correctly
- [ ] Error messages announced via aria-live
- [ ] Allergen badges read as "Contains allergen: [name]"
- [ ] "Add to cart" button announces price
- [ ] Cart count in navbar announced on change
- [ ] Focus order is logical throughout checkout

### TalkBack (Android) — search and filter
- [ ] Allergen filter dropdown accessible
- [ ] Filter state changes announced
- [ ] Product cards fully navigable by swipe
- [ ] "Sold by [Seller Name]" announced on product card

---

## P2 — Cross-Browser / Device Matrix

| Browser | Desktop | Mobile |
|---|---|---|
| Chrome (latest) | ✅ Required | ✅ Required |
| Firefox (latest) | ✅ Required | ✅ Required |
| Safari (latest) | ✅ Required | ✅ Required (iOS) |
| Edge (latest) | ✅ Required | — |
| Samsung Internet | — | ⏳ Nice to have |

### Breakpoints to test
| Breakpoint | Width | Key pages |
|---|---|---|
| Mobile S | 320px | Homepage, search, product, cart |
| Mobile L | 414px | Homepage, search, product, cart |
| Tablet | 768px | All pages |
| Desktop | 1280px | All pages |
| Wide | 1920px | All pages |

---

## P2 — Performance Regression Tests (Lighthouse CI)

Targets (fail CI if below):

| Metric | Minimum score |
|---|---|
| Performance | 80 |
| Accessibility | 90 |
| Best Practices | 90 |
| SEO | 80 |

Core Web Vitals targets:

| Metric | Target |
|---|---|
| LCP (Largest Contentful Paint) | < 2.5s |
| INP (Interaction to Next Paint) | < 200ms |
| CLS (Cumulative Layout Shift) | < 0.1 |

---

## Test Tools

| Tool | Purpose | When |
|---|---|---|
| Jest + ts-jest | Compliance engine unit tests | Every commit (CI) |
| Jest + Testing Library | Web component tests | Every commit (CI) |
| axe-core CLI | Automated accessibility scan | Every build (CI) |
| Lighthouse CI | Performance budgets | Every build (CI) |
| pnpm audit | Dependency vulnerabilities | Every commit (CI) |
| Playwright | E2E web tests | Pre-release |
| VoiceOver | Manual accessibility | Pre-launch |
| TalkBack | Manual accessibility | Pre-launch |
| BrowserStack | Cross-browser | Pre-launch |
