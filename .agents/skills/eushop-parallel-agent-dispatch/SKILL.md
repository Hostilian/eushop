---
name: eushop-parallel-agent-dispatch
description: Parallel Multi-Agent Dispatch Skill — patterns for running multiple specialist sub-agents simultaneously in EUshop's Claude Code CLI environment with worktree isolation.
---

# Parallel Agent Dispatch

## Overview
EUshop uses `fcc-claude` (Claude Code CLI) which supports spawning multiple agents in parallel via worktrees.

## Dispatch Pattern
```bash
# Spawn 4 agents simultaneously — each in isolated worktree
claude --agent security-auditor \
       --task "Audit packages/compliance for OWASP Top 10" &

claude --agent eu-compliance-auditor \
       --task "Verify allergen declarations and DAC7 thresholds" &

claude --agent database-tuning-specialist \
       --task "Analyse EXPLAIN plans on slow queries" &

claude --agent ui-aesthetics-architect \
       --task "Audit WCAG 2.2 AA compliance on checkout flow" &

wait  # Join all parallel agents
```

## Worktree Isolation Rules
- Each parallel agent gets its own git worktree branch
- Agent changes are committed to worktree branch
- Review orchestration agent merges via PR
- Never have two agents editing the same file simultaneously

## Progress Tracking
Each agent reports to a shared status file:
```
.claude/worktrees/fluffy-hopping-prism/agent-status.md
```

## Anti-Patterns
- ❌ Two agents modifying the same migration file
- ❌ Agents without scoped file targets (causes conflicts)
- ❌ Merging worktrees without review-orchestration-agent sign-off
