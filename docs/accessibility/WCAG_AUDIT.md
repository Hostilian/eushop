# EUshop WCAG 2.2 AA Accessibility & Compliance Audit

**Compliance Level:** WCAG 2.2 AA (European Accessibility Act 2025 Mandate)  
**Testing Tool:** `@axe-core/playwright`  

---

## 1. Accessibility Standards Checklist

- **Contrast Ratio**: Text vs background contrast ratio ≥ 4.5:1 for normal text, ≥ 3.0:1 for large text.
- **Focus Rings**: All interactive elements (`button`, `input`, `a`) feature visible 2px focus rings (`focus:ring-2 focus:ring-blue-600`).
- **ARIA Landmarks**: Pages strictly implement `<header>`, `<main>`, `<nav>`, and `<footer>` HTML5 landmarks with `aria-label` attributes.
- **Keyboard Navigation**: 100% of interactive flows are navigable via `Tab`, `Shift+Tab`, `Enter`, and `Space` key events.
