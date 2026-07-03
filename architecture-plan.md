# Architecture Decision Record: Backend Consolidation for EUshop

## 1. Context

The EUshop project is an early-stage marketplace platform. The current architecture consists of a Next.js frontend, a Node.js Express API Gateway, and a Spring Boot Core Service, backed by PostgreSQL and Redis. Authentication is currently mocked via `localStorage` on the frontend, with a "structurally correct RS256 JWT validation flow" in the Node.js gateway.

Key constraints for the project are:
*   **Solo Developer:** The entire development and operational burden falls on one person.
*   **Fast Timeline:** Rapid iteration and delivery of core features are crucial.
*   **Budget-Conscious:** Minimizing infrastructure costs and operational overhead is important.

Core domains include Food Listings, Orders, User Authentication (with compliance like KYBC/DAC7), Reviews, and Conversations. Strong consistency is required for transactional operations (orders, payments, auth), while eventual consistency is acceptable for less critical aspects (e.g., aggregated reviews). Initial traffic is expected to be low.

## 2. Decision

Consolidate all backend logic, including API gateway responsibilities, into a **Monolithic Spring Boot Core Service**. The Node.js Express API Gateway will be eliminated.

## 3. Rationale

For a solo developer on a fast timeline and tight budget, **simplicity and reduced operational overhead are paramount.** The current "distributed monolith" (Node.js gateway + Spring Boot backend) introduces unnecessary complexity without providing commensurate benefits at this early stage.

This consolidation will:
*   **Significantly reduce cognitive load:** Managing one backend codebase (Java/Spring Boot) instead of two (Node.js/Express + Java/Spring Boot) reduces context switching, debugging effort, and deployment complexity.
*   **Accelerate development:** A single codebase allows for quicker iteration, as changes often span both "gateway" and "core" concerns.
*   **Lower operational costs:** Fewer services mean fewer Docker containers, less memory/CPU usage, and simpler monitoring. This directly translates to lower cloud hosting costs and less time spent on infrastructure.
*   **Simplify security implementation:** A single point for Auth0 integration and JWT validation using robust Spring Security.
*   **Improve data consistency:** All core business logic and authentication can reside within a single transactional boundary.

## 4. Architectural Details

### Key Components and their Responsibilities:

*   **Next.js Frontend (`apps/web`):**
    *   User interface, client-side routing, API calls directly to the Spring Boot backend.
*   **Spring Boot Core Service (`services/core-service`):**
    *   **API Gateway Functionality:** Exposes all REST endpoints, handles request routing, input validation (using Spring's validation annotations or Hibernate Validator), and cross-cutting concerns like logging, security (Auth0 integration), and rate limiting.
    *   **Authentication & Authorization:** Manages user sessions, JWT validation (integrating Auth0's JWKS), and role-based access control using Spring Security. Tokens will be stored in secure, HTTP-only cookies.
    *   **Business Logic:** Implements all core domain logic for users, foods, orders, reviews, conversations, and compliance.
    *   **Data Access:** Interacts with PostgreSQL via JPA/Hibernate.
    *   **Caching:** Uses Redis for session management and caching frequently accessed data.

### Communication Patterns:

*   **Frontend to Backend:** Standard RESTful HTTP API calls.
*   **Internal (within Spring Boot):** Direct method calls, Spring Application Events for internal decoupling of non-critical path operations (e.g., sending a notification after an order is placed).

### Data Ownership Boundaries:

*   **Single Database:** PostgreSQL remains the single source of truth for all core domain data.
*   **Redis:** Owned by the Spring Boot service for caching and session management.

## 5. Risks and Mitigations

*   **Technical Risk: Refactoring Effort for Gateway Logic**
    *   **Mitigation:** Prioritize moving authentication and core routing first. Leverage Spring Security for robust JWT validation and integrate Auth0's JWKS endpoint directly. For simple proxying, direct Spring `@RestController` endpoints are sufficient.
*   **Technical Risk: Monolith Bloat**
    *   **Mitigation:** Apply Domain-Driven Design principles within the monolith. Organize code into clear, cohesive packages (e.g., `com.eushop.core.user`, `com.eushop.core.food`) with well-defined service layers and repositories. Use Spring Application Events for internal, asynchronous decoupling of non-critical path operations.
*   **Organizational Risk: Solo Developer Bottleneck**
    *   **Mitigation:** Maintain excellent, up-to-date documentation (`architecture-plan.md`, `DEVELOPMENT.md`, `STATUS.md`). Use clear, self-documenting code. Ruthlessly prioritize features, focusing on core value and compliance. Automate repetitive tasks (CI/CD, database scripts).

## 6. Future Considerations

*   **Revisiting the Decision:** This architectural decision should be revisited if the team grows significantly, if specific parts of the application face extreme scaling challenges that cannot be addressed by vertical scaling or internal optimizations, or if polyglot persistence becomes a genuine requirement.
*   **Evolution:** The consolidated Spring Boot monolith can evolve. If internal complexity grows, internal eventing can be expanded. If specific domains truly need to scale independently or be owned by separate teams, they can be extracted into microservices later, but only when the benefits clearly outweigh the operational costs.

---
