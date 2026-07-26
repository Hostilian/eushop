# Expo React Native Mobile Architecture

## Overview
EUshop mobile app at `apps/mobile/` uses Expo SDK 51 / React Native for iOS and Android.

## EAS Build Configuration
```json
// eas.json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

## OTA Updates
- Channel: `production`
- Update frequency: on every PR merge to main
- Rollback: via Expo dashboard in < 2 minutes

## Shared Packages
- `packages/types` — product/seller/order schemas
- `packages/compliance` — allergen constants (read-only)
- `packages/ui` — design tokens (colour, spacing)

## Store Requirements
- iOS: Privacy manifest (`PrivacyInfo.xcprivacy`) required
- Android: `INTERNET` + `CAMERA` permissions only
- Both: No biometric data without GDPR Art. 9 consent + DPIA

## Performance Targets
- App launch: < 2s cold start
- List scroll: 60fps minimum
- Search response: < 500ms
