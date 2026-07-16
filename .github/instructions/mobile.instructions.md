---
applyTo: "apps/mobile/**"
---

# Mobile App Rules

- Import allergen lists and VAT logic from `packages/compliance/` — never redefine them here.
- Import shared types from `packages/types/` — never redefine product/seller/order shapes.
- Allergen display must include accessible text labels, not just icons or colour coding (WCAG 1.4.1).
- Offline behaviour: never show stale allergen or price data as if it were current.
  Display a clear "data may be outdated" indicator when serving cached content.
- EAS Update is configured for OTA delivery of non-native changes.
  Compliance text fixes can ship as OTA updates — use this for urgent copy corrections.
