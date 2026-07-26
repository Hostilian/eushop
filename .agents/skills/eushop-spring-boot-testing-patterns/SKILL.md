---
name: eushop-spring-boot-testing-patterns
description: Spring Boot Testing Patterns Skill — unit testing with JUnit 5 + Mockito, integration testing with @SpringBootTest + Testcontainers, and slice tests for repositories.
---

# Spring Boot Testing Patterns

## Unit Test (JUnit 5 + Mockito)
```java
@ExtendWith(MockitoExtension.class)
class ProductServiceTest {
    @Mock ProductRepository productRepository;
    @Mock AllergenValidator allergenValidator;
    @InjectMocks ProductService productService;

    @Test
    void should_reject_food_product_without_allergen_declaration() {
        var product = ProductFixtures.foodProductWithoutAllergens();
        when(allergenValidator.validate(product)).thenThrow(
            new ComplianceException("Allergen declaration required for food products")
        );
        assertThatThrownBy(() -> productService.create(product))
            .isInstanceOf(ComplianceException.class)
            .hasMessageContaining("Allergen declaration required");
        verify(productRepository, never()).save(any());
    }
}
```

## Integration Test (Testcontainers + @SpringBootTest)
```java
@SpringBootTest
@Testcontainers
@Transactional
class ProductRepositoryIntegrationTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
        .withDatabaseName("eushop_test")
        .withInitScript("db/init.sql");

    @Autowired ProductRepository productRepository;

    @Test
    void should_find_products_by_allergen_exclusion() {
        // given: products with and without gluten
        // when: search with gluten exclusion
        // then: only non-gluten products returned
    }
}
```

## Repository Slice Test (@DataJpaTest)
```java
@DataJpaTest
class SellerRepositorySliceTest {
    @Autowired TestEntityManager em;
    @Autowired SellerRepository sellerRepository;

    @Test
    void should_find_sellers_missing_dsa_art30_data() { ... }
}
```

## Coverage Target: 80% on service layer, 100% on compliance logic
