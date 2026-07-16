---
applyTo: "packages/compliance/**"
---

# Compliance Package Rules

- This package is the single source of truth for all regulatory values.
- Every exported constant must have a `// COMPLIANCE-REVIEW:` comment citing the primary source URL.
- VAT rates must include the member state ISO-2 code and the rate type (standard/reduced/super-reduced/zero).
- DAC7 thresholds must be exported as a named object (`DAC7_THRESHOLDS`), never as bare numbers.
- Allergen arrays must use `as const` so TypeScript narrows them to literal union types.
- Do not add business logic here — only data and pure functions.
