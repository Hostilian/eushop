# EUshop V243 — Monorepo Dependency Graph & Architecture Mapping

```mermaid
graph TD
    subgraph Packages ["Single Source of Truth Packages"]
        COMPLIANCE["@eushop/compliance<br/>(VAT, Allergens, eAmbrosia, DAC7)"]
        TYPES["@eushop/types<br/>(Zod Schemas, V243 Domain)"]
    end

    subgraph Frontends ["Application Frontends"]
        WEB["apps/web<br/>(Next.js Pages, Static Export)"]
        MOBILE["apps/mobile<br/>(React Native / Expo)"]
    end

    subgraph Backend ["Core Services & DB"]
        SPRING["services/core-service<br/>(Spring Boot 3 REST API)"]
        POSTGRES[("PostgreSQL + PostGIS<br/>(Flyway Migrations)")]
    end

    COMPLIANCE --> WEB
    TYPES --> WEB
    TYPES --> MOBILE
    SPRING --> POSTGRES
    WEB -. REST API .-> SPRING
    MOBILE -. REST API .-> SPRING
```

---

## Shared Package Ownership Rules

1. **Regulatory Single Source of Truth**: All VAT rates, allergen constants, DAC7 thresholds, and eAmbrosia GI definitions MUST reside exclusively in `packages/compliance/`.
2. **Type Safety**: All API requests, response payloads, and domain models MUST consume Zod schemas from `packages/types/`.
3. **No Direct Mutative Parallel Schema Changes**: Schema changes require a `schema-request` document under `docs/v243/schema-requests/` before Flyway migration modification.
