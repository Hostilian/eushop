---
name: eushop-typescript-strict-mode-enforcement
description: TypeScript Strict Mode Enforcement Skill — enforces noUncheckedIndexedAccess, exactOptionalPropertyTypes, and bans `any` usage across the EUshop monorepo.
---

# TypeScript Strict Mode Enforcement

## tsconfig.json (Root)
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": false
  }
}
```

## Banned Patterns
```typescript
// ❌ NEVER use `any`
const data: any = response.json();

// ✅ Use `unknown` and narrow
const data: unknown = response.json();
if (typeof data === 'object' && data !== null) { ... }

// ❌ Non-null assertion abuse
const user = maybeUser!.name;

// ✅ Explicit guard
if (!maybeUser) throw new Error('User not found');
const user = maybeUser.name;

// ❌ Untyped array access
const first = items[0].id; // may be undefined

// ✅ With noUncheckedIndexedAccess
const first = items[0]; // type: Item | undefined
if (first) { console.log(first.id); }
```

## ESLint Rules (Enforced)
```json
{
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/no-non-null-assertion": "warn",
  "@typescript-eslint/prefer-nullish-coalescing": "error",
  "@typescript-eslint/strict-boolean-expressions": "error"
}
```
