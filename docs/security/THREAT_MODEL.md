# EUshop System Threat Model (STRIDE Framework)

**Version:** 1.0  
**Scope:** Complete Monorepo Architecture (`apps/web`, `services/core-service`, `packages/compliance`, `db/migrations`)  
**Standard:** OWASP Top 10 & STRIDE Threat Analysis  

---

## 1. STRIDE Analysis Matrix

| Threat Category | Target Module | Identified Risk | Technical & Architectural Mitigation Controls | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Spoofing Identity** | Auth & Identity | JWT token forging / Auth0 impersonation | `JwtAuthenticationFilter` fails closed in production; signature, issuer & audience verified. | `VERIFIED` |
| **Tampering with Data** | Checkout & Order | Price tampering in client cart requests | Server-authoritative price re-calculation in `PaymentService` before Stripe PaymentIntent creation. | `VERIFIED` |
| **Repudiation** | Admin & Moderation | Unaudited operator actions | `ModerationService` maintains synchronized audit logs (`getAuditLogs`) recording admin ID & timestamp. | `VERIFIED` |
| **Information Disclosure** | DAC7 & Tax Records | Exposure of sensitive seller TIN / revenue data | Column-level authorization checks and role-gated `Dac7Controller` endpoints. | `VERIFIED` |
| **Denial of Service** | File Uploads & Search | Unrestricted file uploads / heavy wildcard queries | `FileStorageService` enforces 10MB size limit, content-type whitelist, and `startsWith` root boundary check. | `VERIFIED` |
| **Elevation of Privilege** | User & Admin API | IDOR parameter manipulation on user endpoints | Object-level ownership validation in `UserController` ensuring buyers access only their own records. | `VERIFIED` |

---

## 2. Path Traversal & Injection Containment

### `FileStorageService.java` Security Boundary:
```java
Path destinationFile = this.rootLocation.resolve(filename).normalize().toAbsolutePath();
if (!destinationFile.startsWith(this.rootLocation.toAbsolutePath())) {
    throw new SecurityException("Cannot store file outside current directory root");
}
```

### `Dac7Service.java` Taint Boundary:
```java
BigDecimal consideration = new BigDecimal(rawInput).setScale(2, RoundingMode.HALF_UP);
if (consideration.compareTo(BigDecimal.ZERO) < 0 || consideration.compareTo(MAX_LIMIT) > 0) {
    throw new IllegalArgumentException("Invalid monetary bounds");
}
```
