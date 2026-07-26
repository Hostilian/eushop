# Spring Boot Modular Monolith Architecture

## Overview
EUshop's backend is a Spring Boot modular monolith at `services/core-service/` running on port 3001.

## Module Structure
```
core-service/
  src/main/java/eu/eushop/
    marketplace/      → Product listings, seller management
    checkout/         → Order processing, VAT calculation
    compliance/       → DAC7, DSA, allergen validation
    payments/         → Stripe Connect integration
    search/           → OpenSearch integration
    users/            → Auth, GDPR, profiles
    spatial/          → PostGIS origin queries
    outbox/           → Transactional outbox
    config/           → Security, datasource, OpenTelemetry
```

## Key Spring Boot Starters Used
- `spring-boot-starter-web` — REST API
- `spring-boot-starter-data-jpa` — PostgreSQL/Flyway
- `spring-boot-starter-security` — Auth0 JWT
- `spring-boot-starter-actuator` — Health/metrics
- `micrometer-tracing-bridge-otel` — OpenTelemetry

## Port & API Base
- Service: `http://localhost:3001`
- API prefix: `/api/v1/`
- Actuator: `/actuator/`
