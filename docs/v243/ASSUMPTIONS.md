# EUshop V243 — Assumptions & Constraints

---

## Technical Assumptions
1. **GitHub Pages Hosting**: The frontend (`apps/web`) is deployed via static export (`output: 'export'`) to GitHub Pages (`https://hostilian.github.io/eushop/`). All public routes must pre-render cleanly as static HTML.
2. **Spring Boot Backend Engine**: Core transactional business logic (orders, user management, DAC7 reporting, notifications) executes in `services/core-service` targeting PostgreSQL.
3. **No Secret Ingestion**: secrets and private API keys are NEVER committed to git, logged in build outputs, or stored in repository files.

---

## Legal & Compliance Constraints
1. **Structure vs Certification**: AI agents implement regulatory *structures* (DSA Art 30 cards, DAC7 XML schemas, FIC 1169 allergen fields). Final compliance certification requires qualified legal/tax sign-off in each target EU jurisdiction per `AGENTS.md`.
2. **One Source of Truth**: Regulatory rates and constants exist ONLY in `packages/compliance/`.
