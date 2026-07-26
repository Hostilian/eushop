---
name: eushop-java-modular-monolith-patterns
description: Spring Boot Modular Monolith Patterns Skill — package-by-module organization, module boundary enforcement, and clean dependency inversion for EUshop core-service.
---

# Java Modular Monolith Patterns

## Module Structure (`services/core-service/src/`)
```
main/java/eu/eushop/
├── product/
│   ├── api/          (REST controllers — public interface)
│   ├── application/  (use cases / service layer)
│   ├── domain/       (entities, aggregates, value objects)
│   └── infra/        (repository, JPA, external)
├── seller/
│   ├── api/
│   ├── application/
│   ├── domain/
│   └── infra/
├── compliance/
│   ├── allergen/
│   ├── dac7/
│   └── dsa/
└── shared/
    ├── events/       (domain events for outbox)
    └── audit/        (audit log utilities)
```

## Dependency Rules
- `api` → can use `application`, never `infra` directly
- `application` → can use `domain`, `shared`
- `domain` → no dependencies on other modules (pure Java)
- `infra` → implements `domain` interfaces (DIP)
- Cross-module communication: domain events via outbox, NOT direct calls

## ArchUnit Enforcement
```java
@AnalyzeClasses(packages = "eu.eushop")
class ArchitectureTest {
    @ArchTest
    ArchRule domainLayerShouldNotDependOnInfrastructure =
        noClasses().that().resideInAPackage("..domain..")
            .should().dependOnClassesThat().resideInAPackage("..infra..");
}
```
