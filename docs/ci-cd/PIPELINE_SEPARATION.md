# EUshop CI/CD Pipeline Separation & Deployment Isolation

**Pipeline Strategy:** Fast-Feedback PR Verification vs. Production Static & Container Release  

---

## 1. Pipeline Architecture

1. **`ci.yml` (Pull Request Verification)**:
   - Triggers on PR creation or update to `main`.
   - Runs Maven unit & integration tests (`mvn clean test`), Next.js linting, Zod schema validation, and Playwright headless E2E tests.
   - Zero deployment permissions.

2. **`deploy.yml` (Production Release Gate)**:
   - Triggers exclusively on merge to `main`.
   - Generates Next.js static export (`out/`) with `basePath: '/eushop'`.
   - Deploys static build to GitHub Pages.
