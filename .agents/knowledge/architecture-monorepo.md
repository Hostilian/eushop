---
title: EUshop Monorepo Architecture & Single Source of Truth Knowledge Item
category: Architecture
last_updated: 2026-07-26
---

# EUshop Monorepo Architecture Knowledge Item (KI-001)

## Overview
EUshop is a pan-European e-commerce platform built as a high-performance monorepo:

- `apps/web`: Next.js Pages Router frontend with static HTML export for GitHub Pages.
- `services/core-service`: Java 21 Spring Boot modular monolith backend.
- `packages/compliance`: **SINGLE SOURCE OF TRUTH** for VAT rates, 14 EU allergens, and DAC7 thresholds.
- `packages/types`: Shared Zod and TypeScript schemas for products, sellers, orders, and compliance DTOs.
- `db/migrations`: Sequential Flyway DDL scripts (`V001` through `V245`).

## Core Invariants
1. Regulatory constants (VAT rates, allergen lists, DAC7 thresholds) MUST live in `packages/compliance` ONLY.
2. `apps/web` must support static export (`output: 'export'`) with unoptimized images for GitHub Pages compatibility.
3. Secrets (API keys, Stripe secret keys, Auth0 credentials) NEVER touch code or repository commits.
