# EUshop v66 Software Bill of Materials (SBOM) & License Provenance

**Date:** 2026-07-22  
**Target Release:** EUshop v66  
**Compliance Standard:** SPDX 2.3 & Open Source License Verification  

---

## 1. Third-Party Dependency Licenses

| Component / Layer | Package / Library | License | Provenance & Usage |
| :--- | :--- | :--- | :--- |
| **Frontend Web** | Next.js 14 | MIT | Core web application framework |
| **Frontend Web** | React 18 | MIT | UI rendering engine |
| **Frontend Web** | Tailwind CSS | MIT | Styling framework |
| **Frontend Web** | TanStack Query | MIT | Data fetching & caching |
| **Frontend Web** | Zustand | MIT | Client-side state management |
| **Backend Service** | Spring Boot 3.2.3 | Apache 2.0 | Backend core framework |
| **Backend Service** | Spring Data JPA / Hibernate | LGPL / Apache 2.0 | Object-relational mapping |
| **Backend Service** | PostgreSQL JDBC Driver | BSD-2-Clause | Database connectivity |
| **Backend Service** | Stripe Java SDK | MIT | Payment intent & webhook processing |
| **Compliance Package** | Zod | MIT | Schema validation contracts |
| **AST Analysis Tool** | Graphify | MIT | Dependency graph & AST parser |

---

## 2. Asset & Media License Clearance

- **Product Demo Media**: All product images stored in `apps/web/public/` or `services/core-service/uploads/` are original open-source demonstration assets or licensed under Unsplash/Creative Commons Zero (CC0).
- **Trademarks & Icons**: Icons used are Lucide-React (ISC License). No copyrighted marketplace trademarks are utilized.
