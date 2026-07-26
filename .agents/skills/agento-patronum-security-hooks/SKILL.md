---
name: agento-patronum-security-hooks
description: Defense-in-depth security guardrails & credential leak prevention hooks (agento-patronum). Enforces zero hardcoded secrets, input sanitization, and fail-closed security filters.
---

# Agento Patronum Security Hooks & Guardrails

This skill implements the **agento-patronum** security enforcement suite for AI agents.

## Security Rules
1. **Zero Credential Leaks**: Never print, log, or commit API keys, secrets, DB passwords, or `.env` files.
2. **Deny Path Traversal**: Enforce strict canonical path checks on file uploads/reads.
3. **Fail-Closed Default**: In production environments, missing credentials or invalid JWT signatures MUST reject requests immediately.
