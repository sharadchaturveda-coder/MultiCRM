# Universal CRM Core – Implementation Plan v0.1

## Architecture

### Backend

*   **Technology:** Node.js with NestJS
    *   **Rationale:** JavaScript familiarity, large ecosystem, suitable for API development. NestJS provides structure and maintainability.
    *   **Constitution:** Library-first (Article I) - Core CRM logic will be extracted into a standalone library.
*   **API:** REST/GraphQL
    *   **Rationale:** Flexibility and client choice. GraphQL for efficient data fetching, REST for simplicity.
    *   **Constitution:** CLI Interface Mandate (Article II) - API will be accessible via a CLI.
*   **Database:** PostgreSQL
    *   **Rationale:** Robust, scalable, supports multi-tenancy.
*   **Multi-tenancy:** Database-level isolation (separate schemas per tenant)
    *   **Rationale:** Strongest isolation, simplifies data management.
*   **Offline-first:** Local storage (IndexedDB) + background sync API
    *   **Rationale:** Enables offline usability, improves user experience.

### Frontend

*   **Technology:** React
    *   **Rationale:** Component-based, large ecosystem, suitable for dynamic UIs.
*   **Responsive Design:** Mobile-first approach
    *   **Rationale:** Ensures usability on all devices.
*   **Offline-first:** Service workers
    *   **Rationale:** Enables offline usability, improves user experience.

### Shared

*   **Data Models:** TypeScript
    *   **Rationale:** Type safety, code maintainability.
*   **API Contracts:** OpenAPI/Swagger
    *   **Rationale:** Standardized API definition, code generation.

## Pre-Implementation Gates

### Simplicity Gate (≤3 projects, no future-proofing)

*   [x] Using ≤3 projects? (Backend, Frontend, Shared Library)
*   [x] No future-proofing? (Focus on core CRM features only)

### Anti-Abstraction Gate (direct framework use)

*   [x] Using framework directly? (No custom abstractions over NestJS or React)
*   [x] Single model representation? (Data models defined in TypeScript, used across backend and frontend)

### Integration-First Gate (contracts defined before code)

*   [x] Contracts defined before code? (OpenAPI/Swagger definitions will be created before implementing API endpoints)

## File Creation Order

1.  Create `contracts/` with API specifications
2.  Create test files in order: contract → integration → e2e → unit
3.  Create source files to make tests pass
