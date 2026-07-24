# EUshop V243 — Release Gates & Quality Verification Standard

---

## Release Quality Gates

Before any version increment or release tag:

### Gate 1: Security & Secret Hygiene (PASS)
- Command: `powershell ./scripts/check-secrets.ps1`
- Condition: **Zero committed secrets detected.**

### Gate 2: Compliance Unit Test Suite (PASS)
- Command: `pnpm --filter @eushop/compliance test`
- Condition: **100% test pass rate across all 8 compliance test suites.**

### Gate 3: Web Static Export Production Build (PASS)
- Command: `pnpm --filter web build`
- Condition: **All pages (31/31) pre-render cleanly as static HTML without export errors.**

### Gate 4: Backend Core Service Maven Build (PASS)
- Command: `cmd /c "cd services\core-service && mvnw.cmd test-compile"`
- Condition: **BUILD SUCCESS with 0 compilation errors.**

### Gate 5: CodeQL Zero-Critical Security Audit (PASS)
- Condition: **Zero critical or high security vulnerabilities in Java core service or TypeScript frontends.**
