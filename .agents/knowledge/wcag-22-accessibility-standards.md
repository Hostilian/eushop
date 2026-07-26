# WCAG 2.2 AA Accessibility Standards for EUshop

## Overview
All EUshop UI must meet WCAG 2.2 AA standards. Design tokens in `packages/ui/tokens/` enforce colour compliance.

## Colour Contrast Requirements
- Normal text (< 18pt): minimum 4.5:1 ratio
- Large text (≥ 18pt or 14pt bold): minimum 3:1 ratio
- UI components and states: minimum 3:1 ratio

## New WCAG 2.2 AA Criteria
- **2.4.11 Focus Appearance**: Focus indicator must be 2px solid, offset ≥ 2px
- **2.5.7 Dragging Movements**: All drag functionality must have pointer alternative
- **2.5.8 Target Size Minimum**: Touch targets ≥ 24×24 CSS pixels
- **3.2.6 Consistent Help**: Help mechanisms in consistent location
- **3.3.7 Redundant Entry**: Don't ask for same info twice in a flow

## Required HTML Patterns
```html
<!-- Skip link (REQUIRED on every page) -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<!-- Sold By (DSA Art.30 + Accessibility) -->
<p aria-label="Sold by seller">
  Sold by <a href="/sellers/123">Farmhouse Olive</a>
</p>

<!-- Allergen declaration -->
<ul aria-label="Contains allergens" role="list">
  <li>Wheat (gluten)</li>
</ul>
```

## Testing Tools
- `axe-core` via `@axe-core/playwright`
- Chrome DevTools accessibility tree
- VoiceOver (macOS) / NVDA (Windows)
