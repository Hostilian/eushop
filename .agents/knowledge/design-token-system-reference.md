# Design Token System Reference

## Overview
EUshop uses a unified design token system in `packages/ui/tokens/` enforcing WCAG 2.2 AA colour compliance and premium glassmorphism aesthetics.

## Colour Tokens (CSS Custom Properties)
```css
:root {
  /* Primary palette */
  --color-primary-500: hsl(220, 90%, 56%);
  --color-primary-600: hsl(220, 90%, 46%);

  /* Semantic */
  --color-surface: hsl(220, 15%, 8%);
  --color-surface-elevated: hsl(220, 15%, 12%);
  --color-text-primary: hsl(220, 10%, 95%);
  --color-text-secondary: hsl(220, 10%, 65%);

  /* Compliance colours */
  --color-allergen-warning: hsl(30, 95%, 50%);
  --color-compliance-ok: hsl(140, 70%, 45%);
  --color-compliance-error: hsl(0, 80%, 55%);
}
```

## Glassmorphism Mixin
```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}
```

## Typography Scale
- Font family: `Inter`, `Outfit`, system-ui
- Loaded via: Google Fonts with `display=swap`
- Scale: 12/14/16/18/24/32/48px

## Spacing System
- Base unit: 4px
- Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96px
