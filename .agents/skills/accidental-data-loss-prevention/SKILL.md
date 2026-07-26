---
name: accidental-data-loss-prevention
description: STOP AND VERIFY before running any command or SQL statement that results in irreversible data loss.
---

# Accidental Data Loss Prevention Guardrails

This skill enforces strict confirmation checks before executing destructive operations.

## Destruction Rules
1. **SQL**: Block `DROP TABLE`, `DROP DATABASE`, `TRUNCATE`, or `DELETE` without explicit WHERE clauses.
2. **File System**: Block recursive `rm -rf` on root/home/src directories.
3. **Git**: Block `git reset --hard` or `git push --force` on main branch without user approval.
