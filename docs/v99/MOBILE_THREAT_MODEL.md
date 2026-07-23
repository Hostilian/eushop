# EUshop Version 99 Mobile Threat Model & Security Test Plan

> Threat Model and Application Security Specification based on OWASP Mobile Application Security Verification Standard (MASVS) and MASTG guidance.

---

## 1. High-Risk Threat Scenarios & Mitigations

| Threat Vector | Severity | Impact Description | Implemented Mitigation Control |
| :--- | :--- | :--- | :--- |
| **Authentication Token Theft** | CRITICAL | Unauthorized session hijacking via unencrypted storage | JWT tokens stored in platform-backed encrypted storage (`expo-secure-store`). |
| **Cart Price Manipulation** | CRITICAL | Altering prices or discounts in local app state | Server-authoritative checkout calculation (`orderAPI.createOrder` & backend revalidation). |
| **Insecure Deep Link Redirection** | HIGH | Phishing or unauthorized screen navigation via custom URI schemes | Strict domain validation (`eushop.eu` and `hostilian.github.io`) and explicit path routing. |
| **Sensitive Log Leakage** | HIGH | Exposing credit cards, credentials, or PII in debug logs | Console sanitization and exclusion of authorization headers / credentials from production logging. |
| **Image Upload Abuse** | MEDIUM | Uploading malicious binaries or oversized payloads during seller listing creation | Server-side MIME-type validation, size limits (max 5MB), and client-side image re-encoding. |

---

## 2. Security Test Plan
- **Static Analysis (SAST)**: CodeQL workflow scanning for taint sinks, unvalidated inputs, and dangerous numeric casts.
- **Dependency Audit**: `pnpm audit` execution on every pull request to identify vulnerable third-party packages.
- **Dynamic Analysis**: Testing token refresh lifecycle, expired session eviction, and offline cart idempotency.
