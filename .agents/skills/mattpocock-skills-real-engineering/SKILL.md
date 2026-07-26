---
name: mattpocock-skills-real-engineering
description: Real engineering skills framework for AI agents (mattpocock/skills). Strict TypeScript types, explicit interface boundaries, refactoring patterns, and production-grade architecture.
---

# Matt Pocock Real Engineering Skills

This skill implements the **mattpocock/skills** principles for AI coding agents.

## Core Rules
1. **No Inferred API Signatures**: Explicitly verify exact variable names, method parameters, and response types before usage.
2. **Type-Safety & Zero Any**: Enforce strict TypeScript typing with zero unnecessary type assertions or `any` casting.
3. **Decoupled Architecture**: Modularize components with single responsibility, separating UI representation from data access.
4. **Refactoring Without Regression**: Whenever refactoring existing code, run automated tests before and after to verify zero broken contracts.
