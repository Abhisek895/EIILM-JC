# Coding Standards

## Backend
- Strict TypeScript and explicit DTOs at module boundaries
- No direct model access from controllers (service/repository only)
- Tenant guard required for every repository query on tenant entities
- Domain events emitted for cross-module side effects
- No silent catch blocks

## Frontend
- Feature-first folder structure
- `any` disallowed in app code
- Zod schemas colocated with forms and API mappers
- Permission checks before rendering privileged actions

## General
- Conventional commits
- PR templates with risk and rollback sections
- Architecture decision records for major design choices
