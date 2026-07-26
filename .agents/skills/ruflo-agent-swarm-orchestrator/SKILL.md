---
name: ruflo-agent-swarm-orchestrator
description: Multi-agent swarm orchestration platform (ruvnet/ruflo, formerly Claude Flow). Queen-led hierarchy, subagent state synchronization, RAG integration, and distributed worktrees.
---

# Ruflo (Claude Flow) Swarm Orchestration Engine

This skill implements the **ruvnet/ruflo** multi-agent swarm architecture for coordinating autonomous parallel agents (Claude Code, Antigravity, Codex).

## Swarm Architecture
1. **Queen Lead Agent**: Coordinates high-level mission goals, breaks tasks down, and manages sub-agent workers.
2. **Worker Agents (Specialized Tasks)**:
   - **Frontend Worker**: React/Next.js UI components, Tailwind/CSS styling, WCAG 2.2 AA accessibility.
   - **Backend Worker**: Java Spring Boot controllers, JPA entities, database migrations.
   - **Compliance Audit Worker**: VAT calculation, DAC7 thresholds, DSA Art. 30/32 traceability, FIC 1169 allergens.
   - **Security & QA Worker**: CodeQL taint analysis, unit & E2E Playwright test execution.
3. **Lock-Free Worktree Discipline**:
   - Each worker operates in isolated worktrees or non-overlapping file sets.
   - Synchronization via git rebase & clean merge protocols.
4. **Adaptive Memory & RAG**:
   - Shared state tracked in `.hermes/v243-state.json` and `.hermes/v243-journal.md`.
