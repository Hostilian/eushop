---
name: claude-superpowers-framework
description: Agentic development methodology & skills framework (obra/superpowers). Enforces brainstorming, system planning, TDD (Red-Green-Refactor), sub-agent dispatch, and multi-stage code reviews.
---

# Superpowers Agentic Skills Framework

This skill implements the **obra/superpowers** engineering methodology for autonomous AI agents (Claude Code, Antigravity, Codex).

## Core Principles
1. **Never Jump Straight to Implementation**: Force Socratic brainstorming and architecture planning first.
2. **2–5 Minute Atomic Work Chunks**: Break work into small, verifiable, micro-steps.
3. **Strict Test-Driven Development (TDD)**:
   - **RED**: Write failing tests reproducing the contract/bug.
   - **GREEN**: Implement minimal code to pass the test.
   - **REFACTOR**: Polish implementation while keeping tests green.
4. **Sub-Agent Dispatch & Delegation**: Delegate isolated sub-tasks (e.g. log audits, lint checks, visual regressions) to sub-agents.
5. **Multi-Stage Review**: Every non-trivial change undergoes self-review, AST diff check, and safety audit before marking done.

## Plugin Commands for Claude Code CLI (`fcc-claude`)
```bash
# Register Superpowers Marketplace
/plugin marketplace add obra/superpowers-marketplace

# Install Superpowers Plugin
/plugin install superpowers@superpowers-marketplace
```

## Workflow Execution Steps
1. `/brainstorm` — Define specs, edge cases, and compliance boundaries.
2. `/plan` — Generate step-by-step micro-plan in `implementation_plan.md`.
3. `/tdd` — Execute Red-Green-Refactor sequence.
4. `/review` — Run automated code review & diff verification.
