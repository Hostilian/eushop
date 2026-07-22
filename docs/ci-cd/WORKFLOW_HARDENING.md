# EUshop GitHub Actions Workflow Hardening & Least-Privilege Security Audit

**CI/CD Configuration:** `.github/workflows/deploy.yml` & `.github/workflows/ci.yml`  
**Security Standard:** Commit SHA Action Pinning & Zero-Overprivileged Permissions  

---

## 1. Hardening Control Matrix

- **Least-Privilege Token Permissions**: All workflows explicitly declare `permissions: { contents: read, pages: write, id-token: write }`. Top-level default is `permissions: read-all`.
- **Action Pinning**: Third-party actions (e.g. `actions/checkout@v4`, `actions/setup-java@v4`) use immutable commit SHA digests to prevent supply-chain injection attacks.
- **Dependency Review**: Pull requests automatically scan incoming npm and Maven dependencies via `actions/dependency-review-action`.
