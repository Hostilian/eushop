---
name: graphify-codebase-analysis
description: "Graphify AST Codebase Dependency & Structural Acceleration Skill for EUshop AI Agents"
---

# Graphify Codebase Dependency & Structural Acceleration Skill

## Overview

This skill leverages **Graphify** (`tools/graphify`) to construct graph-based structural dependency trees of the EUshop repository (`Hostilian/eushop`).

Use this skill whenever:
- Analyzing cross-module dependencies between `apps/web`, `services/core-service`, `packages/compliance`, and `packages/types`.
- Distributing non-overlapping tasks across parallel sidecar workers (`security`, `tests`, `frontend`, `docs`).
- Performing AST impact analysis before large refactoring cycles.

---

## Direct Usage Commands

### 1. Generate Graphify Codebase Analysis
```bash
python -m graphify analyze D:\CODING\eushop
```

### 2. Inspect Dependency Edges
```bash
graphify export --format json --output docs/v66/codebase-graph.json
```

---

## Multi-Agent File Isolation Protocol

When distributing tasks to sidecar worktrees (`D:\CODING\eushop-agents\`):
1. **Primary Lane (`D:\CODING\eushop`)**: Core transaction & order processing (`OrderService.java`, `PaymentService.java`).
2. **Security Sidecar (`D:\CODING\eushop-agents\security`)**: Authorization, path validation, CSP headers (`FileStorageService.java`, `SecurityConfig.java`).
3. **Tests Sidecar (`D:\CODING\eushop-agents\tests`)**: Playwright E2E and property tests (`e2e/`, `test/`).
4. **Frontend Sidecar (`D:\CODING\eushop-agents\frontend`)**: Design system tokens & WCAG accessibility (`apps/web/components/`).
5. **Docs Sidecar (`D:\CODING\eushop-agents\docs`)**: Ground truth inventory & SBOM (`docs/v66/`).
