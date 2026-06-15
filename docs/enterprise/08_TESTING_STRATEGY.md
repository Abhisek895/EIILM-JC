# Testing Strategy

## Test Pyramid
- Unit tests: services, validators, utility logic
- Integration tests: controller + service + repository with test DB
- API contract tests: OpenAPI compliance
- E2E tests: critical user journeys (admin and student)

## Backend Tooling
- Jest + ts-jest for unit/integration
- Supertest for API integration
- Testcontainers for isolated MySQL/Redis tests

## Frontend Tooling
- React Testing Library for component behavior
- MSW for API mocking
- Playwright/Cypress for E2E flows

## Coverage Targets
- Service layer >= 80%
- Controller layer >= 70%
- Shared security/auth code >= 90%
- Critical frontend flows >= 80%

## Mandatory Release Gates
- Lint and type checks pass
- Unit and integration test suites pass
- E2E smoke for staging pass
- Coverage threshold gate enforced in CI
