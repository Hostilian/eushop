# Testcontainers Integration Testing Reference

## Overview
EUshop Spring Boot integration tests use Testcontainers for real database, Redis, and OpenSearch test isolation.

## Core Dependencies
```xml
<!-- services/core-service/build.gradle -->
testImplementation "org.testcontainers:junit-jupiter:1.19.3"
testImplementation "org.testcontainers:postgresql:1.19.3"
testImplementation "org.testcontainers:redis:1.19.3"
```

## Shared Container Setup (Singleton Pattern)
```java
// Singleton pattern — start containers once for all tests
public abstract class AbstractIntegrationTest {
    static final PostgreSQLContainer<?> postgres;
    static final GenericContainer<?> redis;

    static {
        postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("eushop_test")
            .withUsername("test")
            .withPassword("test")
            .withReuse(true);  // reuse across test runs for speed

        redis = new GenericContainer<>("redis:7-alpine")
            .withExposedPorts(6379)
            .withReuse(true);

        postgres.start();
        redis.start();
    }

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.data.redis.host", redis::getHost);
        registry.add("spring.data.redis.port", () -> redis.getMappedPort(6379));
    }
}
```

## Key Benefit
Tests run against real PostgreSQL with real Flyway migrations applied.
Tests are isolated (each test in `@Transactional` is rolled back).
