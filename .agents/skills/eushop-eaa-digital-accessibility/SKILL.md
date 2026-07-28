---
name: eushop-eaa-digital-accessibility
description: Skill for testing EN 301 549 accessibility conformance on checkout, product search, and user account interfaces.
---

# European Accessibility Act (EAA) — Directive 2019/882

## Overview
The European Accessibility Act (Directive 2019/882) applies to e-commerce platforms from 28 June 2025. EUshop must meet WCAG 2.1 Level AA (harmonised via EN 301 549) across all customer-facing interfaces, with priority on checkout, product search, and account management.

// COMPLIANCE-REVIEW: National transposition laws may add additional requirements beyond the directive minimum. Verify per member state before confirming compliance.

## WCAG 2.1 AA Priority Pages

| Page | Critical WCAG SCs | Known Risk |
|------|--------------------|-----------|
| Checkout flow | 1.4.3 Contrast, 2.1.1 Keyboard, 4.1.3 Status | Payment error messages |
| Product search | 1.3.1 Info & Structure, 4.1.2 Name/Role/Value | Filter controls |
| Product detail | 1.1.1 Alt text, 1.4.5 Images of text | Product images |
| Account / login | 1.3.5 Autocomplete, 3.3.2 Labels | Form fields |
| Cookie consent | 2.1.1 Keyboard, 4.1.2 Name/Role/Value | Modal traps |

## Automated Accessibility Testing

```typescript
// In CI pipeline: apps/web/tests/a11y/
// Using axe-core via @axe-core/playwright
import { checkA11y } from 'axe-playwright';

test('Product detail page meets WCAG 2.1 AA', async ({ page }) => {
  await page.goto('/products/test-product');
  await checkA11y(page, undefined, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
    // COMPLIANCE-REVIEW: Automated tools catch ~30-40% of issues — manual testing required too
  });
});

test('Checkout step 1 is keyboard navigable', async ({ page }) => {
  await page.goto('/checkout');
  // Tab through all interactive elements, verify focus visible
  // Verify form labels programmatically associated
  // Verify error messages linked to inputs via aria-describedby
});
```

## Accessibility Statement Requirements

```typescript
// Required by EAA — must be published at /accessibility or linked from footer
export interface AccessibilityStatement {
  conformanceLevel: 'WCAG_2_1_AA';
  testDate: Date;
  testMethodology: string;    // e.g. 'WCAG-EM evaluation, automated + manual'
  knownIssues: AccessibilityIssue[];
  feedbackEmail: string;      // For reporting accessibility issues
  enforcementBodyName: string; // National authority contact
  // COMPLIANCE-REVIEW: Update at minimum annually or after significant UI changes
}

export interface AccessibilityIssue {
  description: string;
  wcagCriteria: string;       // e.g. '1.4.3 Contrast (Minimum)'
  affectedPages: string[];
  remediationTimeline: Date;  // Must be provided
}
```

## Key Implementation Rules

```tsx
// Non-negotiable patterns across all EUshop UI components:

// 1. Skip navigation link
<a href="#main-content" className="skip-link">Skip to main content</a>

// 2. Focus visible (minimum 2px solid outline)
// In CSS: :focus-visible { outline: 2px solid var(--color-focus); outline-offset: 2px; }

// 3. Form error association
<input id="email" aria-describedby="email-error" aria-invalid={!!error} />
<span id="email-error" role="alert">{error}</span>

// 4. Icon buttons must have accessible names
<button aria-label="Remove item from cart">
  <TrashIcon aria-hidden="true" />
</button>

// 5. Images must have meaningful alt text
<img src={product.image} alt={product.name} /> // Not alt=""
```

## Colour Contrast Minimums (WCAG 1.4.3)

```typescript
// packages/compliance/src/accessibility.ts
export const WCAG_CONTRAST_RATIOS = {
  normalText: 4.5,    // AA requirement for text < 18pt
  largeText: 3.0,     // AA requirement for text ≥ 18pt (bold ≥ 14pt)
  uiComponents: 3.0,  // AA requirement for UI component boundaries
} as const;
```

## Source Files
- `apps/web/tests/a11y/` — axe-playwright accessibility test suite
- `apps/web/components/` — all components must follow WCAG patterns
- `apps/web/pages/accessibility.tsx` — accessibility statement page
- See also: `eushop-wcag-accessibility-design-tokens` skill
