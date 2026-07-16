# Security Policy

## Supported Versions

The following versions of `eushop` are currently supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1.0 | :x:                |

## Security Architecture Overview

EUshop enforces modern web security best practices across all components:

1.  **Access Control & Authentication**:
    *   Ingress traffic routes directly to the Spring Boot `core-service`. All endpoints are secured by Spring Security.
    *   Auth0 RS256 JWT tokens are verified directly against the Auth0 JWKS endpoint.
    *   Client-supplied identity headers (`X-User-*`) are stripped at the ingress security filter level. Security context headers are injected only after successful cryptographic signature validation.
    *   Mock base64 authentication is restricted solely to the `dev` and `test` active profiles and gated by the `NEXT_PUBLIC_USE_MOCK_AUTH` configuration. It is strictly disabled in production.
2.  **CORS Policy**:
    *   CORS is centrally managed by Spring Security using an allowed-origins whitelist defined via `eushop.cors.allowed-origins`. Wildcard origins (`*`) are prohibited.
3.  **Payment Security**:
    *   Stripe webhook endpoints verify event signatures (`Stripe-Signature` header) against the configured `STRIPE_WEBHOOK_SECRET`. The application fails to start in production if the secret is a placeholder.
    *   Idempotency is enforced by tracking processed event IDs in the `processed_webhook_events` database table.
    *   Idempotency keys (using `X-Correlation-ID`) are passed to all Stripe PaymentIntent creation requests.

4. **Build and deployment security**:
   * The canonical CI workflow applies least-privilege permissions and gates GitHub Pages deployment on Node, Maven, configuration, and security jobs.
   * Gitleaks and CodeQL scan source and history available to CI. Findings must be triaged before release; scanner coverage is not a substitute for review.
   * CI does not render Compose configuration or print environment values. Local Compose defaults are for development only; use an untracked `.env` file for non-default local credentials.

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please report it to our team.

Do **NOT** open a public issue on GitHub. Instead, please email your report to:
`security@eushop.eu`

Please include:
*   A description of the vulnerability.
*   Steps to reproduce the vulnerability (or a proof-of-concept script/exploit).
*   Any potential impact or mitigations.

We will acknowledge receipt of your report within 48 hours and provide a timeline for resolution.
