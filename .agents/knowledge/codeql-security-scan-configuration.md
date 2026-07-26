# CodeQL Security Scan Configuration

## Overview
EUshop runs CodeQL security scans on every PR and push to main. Zero critical findings required to merge.

## Scan Configuration
```yaml
# .github/workflows/codeql.yml
- uses: github/codeql-action/analyze@v3
  with:
    languages: javascript-typescript, java
    queries: security-and-quality
```

## Zero-Critical Policy
CI gate fails on any finding with severity `critical` or `high`.
`medium` and `low` findings are reported but do not block merge.

## Common EUshop Findings to Watch
1. **Path traversal** — `req.path` used in `fs.readFile()` without `.normalize()`
2. **SQL injection** — string concatenation in JPQL queries
3. **XSS** — `dangerouslySetInnerHTML` with unescaped user content
4. **SSRF** — user-controlled URLs passed to `fetch()`
5. **Hardcoded credentials** — any literal starting with `sk_`, `pk_`, `Bearer `

## Taint Sink Remediation Pattern
```typescript
// VULNERABLE
const file = fs.readFileSync(req.query.path);

// SAFE
const safePath = path.normalize(req.query.path).replace(/^(\.\.(\/|\\|$))+/, '');
if (!safePath.startsWith(ALLOWED_DIR)) throw new Error('Path traversal detected');
const file = fs.readFileSync(path.join(ALLOWED_DIR, safePath));
```
