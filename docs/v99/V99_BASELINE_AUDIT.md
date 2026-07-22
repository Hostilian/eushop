# EUshop Version 99 Baseline Forensic Repository Audit

> Generated on 2026-07-22 as the authoritative baseline evaluation for EUshop Version 99 (v99) Mobile Productionization.

---

## 1. Actual Technology Stack
- **Monorepo Manager**: `pnpm@9.7.1` (`pnpm-workspace.yaml` defining `apps/*` and `packages/*`).
- **Web App**: Next.js 15.5 (Pages Router, React 18, Tailwind/Vanilla CSS, static export for GitHub Pages).
- **Mobile App (`apps/mobile`)**: Expo SDK (React Native), React Navigation (bottom tabs), Expo splash, camera, location, notifications, async storage.
- **Packages**:
  - `packages/compliance`: EU allergens (FIC 1169/2011), VAT calculation engine, DAC7 thresholds, OSS limits.
  - `packages/types`: Zod & TypeScript shared schemas.
- **Backend Services**: Spring Boot core service (`services/core-service`), PostgreSQL migrations (`db/`).
- **CI/CD**: GitHub Actions (`.github/workflows/android-build.yml`, `ci-cd-pipeline.yml`, `nextjs.yml`).

---

## 2. Repository Map
```text
d:\CODING\eushop\
├── apps/
│   ├── web/          → Next.js 15 Web Application (Flagship EUshop v77 UI)
│   └── mobile/       → Expo / React Native Mobile Application (v99 Target)
├── packages/
│   ├── compliance/   → Single Source of Truth for EU Regulations (Allergens, VAT, DAC7)
│   └── types/        → Shared Zod / TypeScript schemas
├── services/
│   └── core-service/ → Spring Boot monolith
├── db/               → PostgreSQL Flyway migrations
├── docs/
│   ├── v77/          → EUshop v77 Web Editorial documentation
│   └── v99/          → EUshop v99 Mobile-First Productionization documentation (NEW)
└── .github/
    └── workflows/    → GitHub Actions CI/CD pipelines
```

---

## 3. Currently Executable Applications & Commands Attempted

### Web Application (`@eushop/web`)
- Command: `pnpm --filter "@eushop/web" exec tsc --noEmit` → **PASS** (0 errors).
- Command: `pnpm --filter "@eushop/web" run test` → **PASS** (23/23 suites, 106/106 tests).
- Command: `pnpm --filter "@eushop/web" run build` → **PASS** (26/26 static pages exported).

### Mobile Application (`@eushop/mobile`)
- Command: `pnpm --filter "@eushop/mobile" exec tsc --noEmit` → **FAIL** (`screens/ProfileScreen.tsx(89,9): error TS17002: Expected corresponding JSX closing tag for 'SafeAreaView'`).
- Dependency Audit: `apps/mobile/package.json` contains **NO `dependencies` or `devDependencies` block**. Dependencies were implicitly resolved or missing from lockfile.
- EAS Build Workflow: `.github/workflows/android-build.yml` relies on global `eas-cli@latest`, legacy `npm install`, and silently ignores missing `EXPO_TOKEN` secrets instead of failing explicitly.

---

## 4. Current Failure Diagnostic Log & Root Causes

### 1. `apps/mobile/package.json` Missing Dependencies
- **Root Cause**: `apps/mobile/package.json` only contained `"name"`, `"version"`, `"main"`, and `"scripts"`. No explicit declarations for `expo`, `react`, `react-native`, `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-native-async-storage/async-storage`, `expo-camera`, `expo-location`, `expo-notifications`, etc.
- **Impact**: Non-deterministic installs, vulnerability to global state, CI failure.

### 2. Malformed JSX Syntax in `ProfileScreen.tsx`
- **Root Cause**: Line 58 opens `<SafeAreaView>`, but line 89 closes `</View>`.
- **Impact**: `tsc --noEmit` fails immediately.

### 3. Architecture Contradiction: Navigation Structure
- **Root Cause**: `apps/mobile/App.tsx` configures React Navigation (`NavigationContainer` + `BottomTabNavigator`), but `apps/mobile/app/allergen-filter.tsx` exists under an `app/` folder, suggesting abandoned Expo Router migration.
- **Impact**: Confusing file layout, double router reference.
- **Resolution**: Consolidate all screen components in `apps/mobile/screens/` under React Navigation.

### 4. CI Pipeline Vulnerabilities & False Greens
- **Root Cause**: `android-build.yml` outputs `"EXPO_TOKEN not set — skipping EAS cloud build."` and exits with status 0, masking missing deployment secrets as green builds.
- **Impact**: False confidence in release pipelines.

---

## 5. Mobile Dependency Analysis & Pinning Target

| Package Name | Current Status | v99 Target Version | Expo SDK Compatibility |
| :--- | :--- | :--- | :--- |
| `expo` | Missing in package.json | `~51.0.0` | SDK 51 |
| `react` | Missing in package.json | `18.2.0` | SDK 51 standard |
| `react-native` | Missing in package.json | `0.74.5` | SDK 51 standard |
| `@react-navigation/native` | Missing in package.json | `^6.1.18` | Compatible |
| `@react-navigation/bottom-tabs` | Missing in package.json | `^6.6.1` | Compatible |
| `react-native-safe-area-context` | Missing in package.json | `4.10.5` | SDK 51 pinned |
| `react-native-screens` | Missing in package.json | `3.31.1` | SDK 51 pinned |
| `react-native-gesture-handler` | Missing in package.json | `~2.16.1` | SDK 51 pinned |
| `expo-splash-screen` | Missing in package.json | `~0.27.5` | SDK 51 pinned |
| `expo-task-manager` | Missing in package.json | `~11.8.2` | SDK 51 pinned |
| `expo-background-fetch` | Missing in package.json | `~12.0.1` | SDK 51 pinned |
| `expo-camera` | Missing in package.json | `~15.0.16` | SDK 51 pinned |
| `expo-location` | Missing in package.json | `~17.0.1` | SDK 51 pinned |
| `expo-notifications` | Missing in package.json | `~0.28.19` | SDK 51 pinned |
| `expo-device` | Missing in package.json | `~6.0.2` | SDK 51 pinned |
| `expo-haptics` | Missing in package.json | `~13.0.1` | SDK 51 pinned |
| `expo-barcode-scanner` | Missing in package.json | `~13.0.1` | SDK 51 pinned |
| `@react-native-async-storage/async-storage` | Missing in package.json | `1.23.1` | SDK 51 pinned |

---

## 6. Prioritized v99 Repair Order

1. **Stage 1**: Establish baseline audit & execution plan (`docs/v99/V99_BASELINE_AUDIT.md` & `MOBILE_ARCHITECTURE.md`).
2. **Stage 2**: Make Mobile Application Pinned & Deterministically Buildable (reconstruct `apps/mobile/package.json`, fix JSX syntax in `ProfileScreen.tsx`, run `pnpm install`, consolidate `allergen-filter.tsx` into `screens/`).
3. **Stage 3**: Mobile Design System & Native Components (semantic color tokens, typography scale, responsive primitives, allergen indicators, seller verification badges).
4. **Stage 4**: Complete Buyer Vertical Slice (`Auth → Discovery → Search & Filter → Product Detail → Cart → Checkout → Order Confirmation`).
5. **Stage 5**: Complete Account & Trust Features (Profile, Privacy, In-App Account Deletion, Messaging, Report Listing, Permission Education).
6. **Stage 6**: Complete Seller Vertical Slice (Trader Identity State, Listing Draft with Camera/Image upload, Allergen Selection, Payout Readiness).
7. **Stage 7**: Mobile Threat Model, Security, Accessibility & Reliability (OWASP MASVS, secure storage for auth tokens, WCAG 2.2 AA accessibility, offline caching).
8. **Stage 8**: Rebuild Android GitHub Actions Pipeline (Pull-request validation, preview APK with SHA-256 artifact upload, production signed AAB workflow, explicit credential failure gate).
9. **Stage 9**: Store Readiness & Documentation (`GOOGLE_PLAY_RELEASE_CHECKLIST.md`, privacy data map, compliance control matrix, external blockers).
