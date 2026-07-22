# EUshop v77 Ground Truth & Baseline Audit

## 1. Environment & Technical Stack
- **Repository Root**: `D:\CODING\eushop`
- **Active Git Branch**: `agent/v77-20260722-2101`
- **Frontend Framework**: Next.js 15.5.20 (Pages Router) in `apps/web`
- **Styling Engine**: TailwindCSS v3 (`apps/web/tailwind.config.ts`), `@tailwindcss/forms`
- **Deployment Model**: GitHub Pages static export (`next build` output to `apps/web/out`)
- **Shared Packages**:
  - `packages/compliance`: Reg. 1169/2011 allergens, DAC7 thresholds, OSS thresholds
  - `packages/types`: Shared TypeScript & Zod schemas for food products, sellers, orders

## 2. Baseline Status
- **Type Checking**: Clean (`0 errors` across `@eushop/web` and monorepo packages)
- **Static Export**: 26 pages prerendered successfully to `apps/web/out/`
- **Test Coverage**: 34/34 Jest tests passing in `packages/compliance`

## 3. Key Findings & Directives for v77
1. **Product Positioning**: Shift from government/regulatory-style appearance to a contemporary European food atlas & editorial marketplace ("Shop Europe like a local").
2. **Visual Tokens**: Introduce warm porcelain canvas (`#f7f4ed`), deep ink (`#141613`), European cobalt blue (`#1845d4`), saffron gold (`#e5a024`), terracotta (`#c84e38`), herb green (`#365e38`), soft mineral borders (`#dcd7cb`).
3. **Data Integrity**: Retain 100% authoritative fallback & local catalog data. Explicitly label demo catalog items when live API endpoints are unreachable.
