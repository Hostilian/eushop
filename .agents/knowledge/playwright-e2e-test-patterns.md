# Playwright E2E Test Patterns for EUshop

## Overview
Critical E2E tests cover buyer checkout, allergen filter, and seller onboarding flows using Playwright.

## Test Structure
```
tests/
  e2e/
    checkout.spec.ts        → Full checkout journey
    allergen-filter.spec.ts → 14 allergen filter UI
    seller-onboarding.spec.ts → DSA Art.30 onboarding
    product-search.spec.ts  → Full-text + spatial search
```

## Checkout Critical Journey
```typescript
test('buyer can complete checkout with VAT', async ({ page }) => {
  await page.goto('/products/olive-oil-greek');
  await page.click('[data-testid="add-to-cart"]');
  await page.click('[data-testid="checkout"]');
  await expect(page.locator('[data-testid="vat-display"]')).toBeVisible();
  await expect(page.locator('[data-testid="sold-by-seller"]')).toBeVisible(); // DSA Art.30
  await page.fill('[data-testid="card-number"]', '4242424242424242');
  await page.click('[data-testid="pay-now"]');
  await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible();
});
```

## Visual Regression Baseline
- Breakpoints: 375px, 768px, 1440px
- Threshold: 2% pixel difference
- Update baselines: `npx playwright test --update-snapshots`

## Flaky Test Policy
More than 2 failures in 10 runs → investigate before merging.
