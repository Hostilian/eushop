---
name: codeql-security-taint-remediation
description: Semantic static analysis & zero-critical taint sink remediation skill (codeql-community). OWASP Top 10 mitigation, path traversal prevention, and SQL injection defense.
---

# CodeQL Security Taint Remediation Engine

This skill implements CodeQL semantic security analysis standards.

## Audit Rules
1. **Taint Tracking**: Trace unsanitized user inputs to dangerous sinks (file reads, SQL queries, command execution).
2. **Path Normalization**: Validate file paths with `.toPath().normalize()` to prevent `../` traversal attacks.
3. **Prepared Statements**: Use JPA/Hibernate parameterized queries for database interactions.
