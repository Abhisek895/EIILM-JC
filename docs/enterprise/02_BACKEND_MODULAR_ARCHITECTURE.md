# Backend Modular Architecture

## Module Contract
Each module follows:
```text
src/modules/{module}/
  controller/
  service/
  repository/
  routes/
  validator/
  dto/
  types/
  events/
  tests/
```

## Implemented Module Scaffolds
- Foundation: `auth`, `users`, `roles`, `permissions`, `tenants`, `sessions`, `dashboard`, `audit-logs`
- ERP: `admissions`, `students`, `courses`, `departments`, `faculty`, `attendance`, `results`, `exams`, `fees`, `timetable`, `library`, `hostel`, `transport`
- CMS: `cms-pages`, `cms-page-builder`, `cms-menus`, `cms-seo`, `cms-media`, `cms-forms`, `cms-content-versioning`
- Integrations: `notifications`, `integrations-webhooks`, `search`

## Shared Layers
- `src/shared/config`: environment, feature flags, per-env tunables
- `src/shared/security`: JWT, TOTP, hashing, device fingerprinting
- `src/shared/cache`: Redis client, cache keys, cache invalidation helpers
- `src/shared/queue`: BullMQ factories, job contracts, retry policies
- `src/shared/observability`: logger, tracing, metrics, correlation IDs
- `src/shared/storage`: S3/Cloudinary adapters and signed URL service

## Request Lifecycle Standard
1. Route middleware resolves tenant and correlation ID
2. Validator layer checks DTO schema
3. Controller maps request to service call
4. Service executes business rules and emits domain events
5. Repository persists with tenant guard and audit metadata
6. Standard API response envelope returned

## Required Cross-Cutting Policies
- Idempotency keys for mutation endpoints
- Input validation at edge with strict schema contracts
- Centralized error taxonomy with business error codes
- Structured logs with `tenant_id`, `user_id`, `correlation_id`
