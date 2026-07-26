---
name: everything-claude-code-harness
description: Cross-harness agentic operating system (affaan-m/everything-claude-code). Performance optimization, memory instincts, security rules, NanoClaw v2 orchestration, and research-first loops.
---

# Everything Claude Code (ECC) Agent Harness

This skill implements the **affaan-m/everything-claude-code** harness optimization system for Claude Code, Antigravity, and AI swarms.

## Key Subsystems
1. **NanoClaw v2 Orchestration**: Lightweight task runner for parallel sub-agent workers.
2. **Continuous Instinct Learning**: Captures project conventions, bug patterns, and architectural rules in `.agents/instincts.md`.
3. **Research-First Protocol**: Prioritizes source code inspection, AST dependency mapping, and primary doc verification over guessing.
4. **Security & Data Loss Prevention**:
   - Zero hardcoded secrets, API keys, or raw JWTs in code/logs.
   - Non-destructive execution: never run broad `DROP`, `TRUNCATE`, `rm -rf`, or git force-pushes without verification.
5. **Context Token Optimization**: Truncates long command outputs, uses grep/ast-search tools over full file dumps, and reads targeted line ranges.

## Continuous Learning Protocol
When an error or correction occurs:
1. Identify the root cause contract failure.
2. Store the rule pattern in `.agents/AGENTS.md` or `.agents/instincts.md`.
3. Verify all future changes against stored instincts.
