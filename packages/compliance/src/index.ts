/**
 * @eushop/compliance
 *
 * Single source of truth for all regulatory logic shared between web and mobile.
 * Nothing compliance-related should be computed outside this package.
 *
 * Rule 3 from AGENTS.md: "One source of truth for anything regulatory."
 */
export * from './allergens';
export * from './vat';
export * from './currency';
export * from './allergen-extractor';
export * from './nutrition-parser';
export * from './quality-scheme-verifier';
export * from './language-compliance';
export * from './eambrosia-verifier';
export * from './dsa-trader-verifier';
