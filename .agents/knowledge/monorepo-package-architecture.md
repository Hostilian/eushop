# Monorepo Package Architecture

## Overview
EUshop is a monorepo managed with npm workspaces. Package dependency rules are strictly enforced.

## Package Dependency Rules
```
apps/web → packages/types, packages/compliance (read-only), packages/ui
apps/mobile → packages/types, packages/compliance (read-only), packages/ui
packages/compliance → no internal deps (pure functions only)
packages/types → no internal deps (Zod schemas only)
services/core-service → packages/compliance (via JAR)
```

## NEVER
- `apps/web` must NEVER import `services/core-service` directly
- `packages/compliance` must NEVER import from `apps/`
- VAT rates/allergens NEVER copied — always imported from `packages/compliance`

## workspace Package.json Structure
```json
{
  "name": "eushop",
  "workspaces": ["apps/*", "packages/*"]
}
```

## Build Order
1. `packages/types` (no deps)
2. `packages/compliance` (no deps)
3. `packages/ui` (depends on types)
4. `apps/web` (depends on all packages)
5. `apps/mobile` (depends on all packages)
