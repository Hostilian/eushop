# OpenAPI Spec & TypeScript Client Generation

## Overview
EUshop uses Springdoc OpenAPI to auto-generate the API spec, then openapi-typescript to generate TypeScript types for the Next.js frontend.

## Spring Boot Springdoc Config
```yaml
springdoc:
  api-docs:
    path: /api-docs
    enabled: true
  swagger-ui:
    path: /swagger-ui.html
    enabled: true  # dev only, disable in prod
  info:
    title: EUshop API
    version: v1
    description: EU Marketplace Platform API
```

## TypeScript Client Generation
```bash
# In CI after backend build
npx openapi-typescript http://localhost:3001/api-docs \
  --output packages/types/src/api.d.ts

# Usage in Next.js
import type { paths } from '@eushop/types/api';
type ProductResponse = paths['/api/v1/products/{id}']['get']['responses']['200']['content']['application/json'];
```

## Breaking Change Detection
```bash
# Run in CI on any backend change
npx openapi-diff baseline-spec.yaml new-spec.yaml --fail-on-incompatible
```

## Versioning Strategy
- Non-breaking changes: add optional fields, new endpoints → no version bump
- Breaking changes: v2 endpoint parallel deploy → deprecation notice → v1 sunset 6 months
