# EUshop CodeQL Taint Analysis & Numeric Cast Remediation Matrix

**Scanner Tool:** GitHub CodeQL Security Analyzer  
**Target Rule Categories:** `java/path-injection`, `java/numeric-cast-taint`, `java/sql-injection`  

---

## 1. Remediation Verification

| Finding ID | Component | Vulnerability Class | Applied Fix & Confinement |
| :--- | :--- | :--- | :--- |
| **CQL-01** | `FileStorageService.java` | Path Injection | `.normalize().toAbsolutePath()` with `startsWith(rootLocation)` check |
| **CQL-02** | `Dac7Service.java` | Tainted Numeric Cast | `BigDecimal.setScale(2, RoundingMode.HALF_UP)` bounds validation |
| **CQL-03** | `FoodService.java` | SQL Injection Risk | Complete parameterized JPA Criteria queries |
