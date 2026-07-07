# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-07-07

### Added
- **Spring Security Configuration**: Implemented centralized CORS registry whitelisting specific development and production origins instead of global wildcards (`*`).
- **Auth0 JWT Authentication**: Added filter to intercept, parse, and cryptographically verify RS256 JWT signatures against the Auth0 JWKS endpoint in production.
- **Request Header Spoof Protection**: Added security wrapper to strip client-provided `X-User-*` headers at the ingress filter level.
- **Correlation ID / Stripe Idempotency**: Configured `X-Correlation-ID` header forwarding to Stripe's `Idempotency-Key` when creating PaymentIntents.
- **Stripe Webhook Deduplication**: Implemented a `processed_webhook_events` Postgres table to deduplicate incoming webhook events and prevent double-processing.
- **Controller Test Suite**: Added `SecurityAndControllerTest.java` verifying CORS, secure gates, mock auth, and Stripe webhook flows using MockMvc.
- **GDPR Compliance Audits**: Created `COMPLIANCE_GAPS.md` mapping alignment with GDPR Article 17 (Right to Erasure), Article 20 (Portability), DSA KYBC seller vetting, DAC7 tax intakes, and EU Food Regulation 1169/2011.
- **Workspace Security Policy**: Added `SECURITY.md` detailing security architecture, secrets management, and private vulnerability reporting.

### Changed
- **GDPR Consent Data Minimization**: Removed raw PII columns (`ipAddress`, `userAgent`, `consentSource`, `version`, `auditNotes`) from the Hibernate `ConsentLog.java` entity, matching database schema migrations storing only SHA-256 hashes.
- **Performance Optimizations (N+1)**: Configured JPA `@EntityGraph` fetch joins in `FoodRepository` and `OrderRepository` to eliminate lazy-loading database round-trips for parent entities.
- **Mock Authentication Firewall**: Locked Next.js local simulated sessions behind a runtime environment check, failing secure and throwing network errors in production builds.

### Removed
- **Exclusion Zone Files**: Permanently deleted stray key harvesting daemons, local key pools, parallel chat scripts, and temporary credentials files.
- **Duplicate Workflows**: Consolidated CI configuration by deleting `ci-cd-pipeline.yml` and obsolete workflow files.
- **Retired Service Artifacts**: Moved retired node `services/api-gateway` to `archive/services/api-gateway`.
