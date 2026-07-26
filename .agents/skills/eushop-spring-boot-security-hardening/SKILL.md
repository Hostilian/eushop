---
name: eushop-spring-boot-security-hardening
description: Spring Boot Security Hardening Skill — configures CSRF protection, security headers, method-level security, and HTTPS enforcement for EUshop core-service.
---

# Spring Boot Security Hardening

## HTTP Security Configuration
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/products/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
            .csrf(csrf -> csrf.disable()) // API-only, no session cookies
            .sessionManagement(sm -> sm.sessionCreationPolicy(STATELESS))
            .headers(headers -> headers
                .frameOptions(HeadersConfigurer.FrameOptionsConfig::deny)
                .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'none'"))
                .httpStrictTransportSecurity(hsts -> hsts
                    .includeSubDomains(true).maxAgeInSeconds(31536000))
            );
        return http.build();
    }
}
```

## Method-Level Security
```java
@PreAuthorize("hasRole('SELLER') and #sellerId == authentication.name")
public void updateProduct(UUID sellerId, Product product) { ... }

@PreAuthorize("hasRole('ADMIN')")
public void deleteUser(UUID userId) { ... }
```

## HTTPS Enforcement
- All production traffic: HTTPS only
- HSTS: max-age=31536000; includeSubDomains; preload
- Redirect HTTP → HTTPS at load balancer level
