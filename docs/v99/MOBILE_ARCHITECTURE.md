# EUshop Version 99 Mobile Architecture Specification

> Architecture Document for EUshop v99 Mobile Application (Expo SDK 51 / React Native).

---

## 1. System Overview
EUshop v99 Mobile is a native mobile application built on React Native & Expo SDK 51, providing a mobile-first marketplace for authentic European regional foods across 27 EU member states.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        EUshop v99 Mobile Application                   │
├────────────────────────────────────────────────────────────────────────┤
│  Navigation Layer: React Navigation (Typed Stack & Bottom Tabs)       │
├────────────────────────────────────────────────────────────────────────┤
│  Feature Modules:                                                      │
│  - Authentication & Identity (/screens/ProfileScreen.tsx)             │
│  - Discovery & Search (/screens/HomeScreen.tsx, /screens/SearchScreen)│
│  - Product Detail & Allergen Disclosure                                │
│  - Cart & Checkout Lifecycle (/screens/CheckoutScreen.tsx)            │
│  - Order Management & History                                          │
│  - Buyer-Seller Messaging (/screens/MessagesScreen.tsx)               │
│  - Seller Listing & Camera Capture (/screens/ListingUploadScreen.tsx)  │
│  - Privacy & In-App Account Deletion (/screens/GDPRScreen.tsx)         │
├────────────────────────────────────────────────────────────────────────┤
│  Core Services:                                                        │
│  - API Client & Degradation Fallbacks (lib/services/apiClient.ts)      │
│  - Secure Storage Engine (expo-secure-store / async-storage)           │
│  - Offline Storage & Product Caching (OfflineStorageService.ts)        │
│  - Push & Local Notifications (NotificationService.ts)                 │
│  - Native Device Capabilities (Camera, Location, Haptics)              │
└────────────────────────────────────────────────────────────────────────┘
                                    │ HTTP / HTTPS (REST API)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      EUshop Core Backend Services                      │
│        (Spring Boot Monolith / Mock Fallback Resilience Server)       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Navigation Architecture Decision
- **Unified Navigation Model**: React Navigation (`@react-navigation/native` & `@react-navigation/bottom-tabs`).
- **Rationale**: The mobile app's primary root `App.tsx` configures a bottom tab bar (`Home`, `Search`, `Messages`, `Profile`) with nested screens (`ListingUpload`, `Checkout`, `GDPR`, `AllergenFilter`, `BarcodeScanner`).
- **Cleanup**: Consolidate `app/allergen-filter.tsx` into `screens/AllergenFilterScreen.tsx` to eliminate competing file-based routing artifacts.

---

## 3. Data Classification & Secure Storage Model

| Data Category | Examples | Storage Target | Security Control |
| :--- | :--- | :--- | :--- |
| **Authentication Tokens** | JWT access & refresh tokens | `expo-secure-store` / Encrypted Storage | AES-256 / Keychain / KeyStore |
| **User Preferences** | Dietary settings, selected allergens | `@react-native-async-storage` | Local App Sandbox |
| **Product & Search Cache** | Cached food listings, categories | `OfflineStorageService.ts` | Local App Sandbox with Stale Invalidation |
| **Ephemeral Session Data** | Checkout draft, search inputs | In-Memory React State | Cleared on unmount / session reset |
| **Prohibited Data** | Credit card numbers, CVVs | NEVER STORED LOCALLY | Server-authoritative Stripe tokens only |

---

## 4. API Client & Failure Degradation Strategy
- **Base Endpoint**: Environment-configurable (`EXPO_PUBLIC_API_URL` with default fallback to `https://api.eushop.eu/api/v1` or local dev `http://10.0.2.2:3001/api/v1`).
- **Resilience Strategy**:
  1. Primary attempt: Fetch live Spring Boot core service REST API.
  2. Timeout handling: 5-second connection timeout per request.
  3. Network Failure Fallback: Fallback to structured `@eushop/compliance` demo datasets and `OfflineStorageService` cache.
  4. Error Envelope: Standardized `{ success: boolean, data?: T, error?: { code: string, message: string } }`.

---

## 5. Offline Capabilities & Background Work
- **Background Fetch**: `expo-background-fetch` and `expo-task-manager` run periodic background product updates (minimum interval 15 minutes).
- **Cart & Order Safety**: Offline cart edits persist in local storage; checkout payments require an active network connection and server-side idempotency validation.
