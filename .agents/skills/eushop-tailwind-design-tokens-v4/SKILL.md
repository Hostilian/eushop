---
name: eushop-tailwind-design-tokens-v4
description: Tailwind CSS v4 Design Token Migration Skill — migrates EUshop from legacy class-based Tailwind to CSS variable-based design tokens with dark mode and WCAG contrast compliance.
---

# Tailwind CSS v4 Design Tokens

## Design Token Architecture
```css
/* app/globals.css */
@theme {
  /* Brand colors — WCAG 2.2 AA verified */
  --color-brand-primary: oklch(55% 0.22 262);   /* EUshop blue */
  --color-brand-accent: oklch(68% 0.18 45);      /* warm amber */

  /* Semantic tokens */
  --color-surface: oklch(99% 0 0);
  --color-surface-dark: oklch(12% 0.015 262);
  --color-text: oklch(15% 0.01 262);
  --color-text-muted: oklch(45% 0.02 262);

  /* Compliance colors — high contrast */
  --color-allergen-warning: oklch(58% 0.22 28);  /* 4.5:1 on white */
  --color-dsa-badge: oklch(42% 0.15 270);
  --color-pdo-badge: oklch(48% 0.18 155);

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
}
```

## WCAG 2.2 AA Requirements
- Normal text: contrast ratio ≥ 4.5:1
- Large text (18pt+): contrast ratio ≥ 3:1
- UI components & focus indicators: ≥ 3:1
- Test with: `npx @accesslint/contrast-ratio`
