# EUshop Supply Chain Security & CI/CD Protection Matrix

**Compliance Standard:** OpenSSF Scorecard & SLSA Level 3 Guidelines  

---

## 1. GitHub Actions Action Pinning & Permissions

- **Least Privilege Permissions**: All GitHub Action jobs enforce explicit scoped `permissions` block (`contents: read`, `id-token: write`).
- **Commit SHA Pinning Standard**: Production release workflows MUST pin third-party GitHub Actions to immutable 40-character commit hashes.
- **Dependency Provenance**: `pnpm-lock.yaml` and `pom.xml` lockfiles are enforced in CI builds with zero dynamic version resolution.

---

## 2. Automated SBOM Generation

- System SBOM manifest is generated at build time using SPDX 2.3 standard (`docs/v66/SBOM_LICENSES.md`).
