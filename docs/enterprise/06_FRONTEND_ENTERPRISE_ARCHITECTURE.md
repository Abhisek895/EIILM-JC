# Frontend Enterprise Architecture

## Architectural Direction
- Modular feature folders with shared design system
- React Query as primary server-state layer
- Redux Toolkit retained for client/session/UI global state
- Zod + React Hook Form for validated forms

## Core Capabilities
- Permission-based routing and route guards
- Dynamic sidebar driven by role + permissions
- Error boundaries + suspense fallbacks
- Skeleton loaders for async pages
- Toast/notification system with queueing
- Theme engine (light/dark/brand variants)
- Accessibility standards (WCAG AA baseline)
- SEO layer (meta, OpenGraph, canonical, structured data)
- PWA support (manifest + service worker + offline shell)

## Recommended Frontend Module Layout
```text
src/
  modules/
    admissions/
    students/
    fees/
    cms-pages/
  core/
    auth/
    permissions/
    routing/
    telemetry/
    ui/
  shared/
    components/
    hooks/
    schemas/
    lib/
```

## Non-Functional Requirements
- Bundle budget enforcement in CI
- Client error telemetry to Sentry
- Web vitals tracked and dashboarded
