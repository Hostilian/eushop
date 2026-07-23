# EUshop Version 99 Google Play Release & Store Readiness Checklist

> Technical & Store-Policy Checklist for Production Submission to Google Play Console.

---

## 1. Technical Release Prerequisites
- [x] **Monotonic Version Code**: `versionCode: 1` in `apps/mobile/app.json` (increments per release).
- [x] **App Package Identifier**: `com.eushop.mobile` registered in Expo and Google Play Console.
- [x] **Target API Level**: Configured for Android 16 / API level 36 readiness.
- [x] **Dependencies Pinned**: Expo SDK 51, React Native 0.74.5, React 18.2.0.
- [x] **Type Safety & Testing**: `tsc --noEmit` PASS (0 errors), `jest` PASS (3/3 tests).

---

## 2. Store Policy Declarations & Assets
- [x] **Data Safety Declaration**: Map generated from `docs/v99/PRIVACY_DATA_MAP.md`.
- [x] **In-App Account Deletion**: Enabled via `GDPRScreen.tsx` with web fallback path.
- [x] **Physical Goods Billing**: Physical food purchases routed via server-authoritative checkout (Stripe Connect).
- [x] **Camera & Location Permission Declarations**: Justification strings defined in `app.json` plugin configurations.
- [x] **Privacy Policy URL**: `https://hostilian.github.io/eushop/privacy`.

---

## 3. Release Pipeline Execution
1. Trigger GitHub Action `Build Android (Expo EAS)`.
2. Select build profile `preview` (for APK) or `production` (for signed AAB).
3. Download generated artifact and verify SHA-256 checksum.
4. Upload AAB to Google Play Console Internal Track.
