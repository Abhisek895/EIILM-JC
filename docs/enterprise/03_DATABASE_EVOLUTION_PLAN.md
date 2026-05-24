# Database Evolution Plan

## Design Principles
- Tenant-aware by default (`tenant_id` on all business entities)
- Public IDs for external APIs (`public_id` UUID/ULID)
- Soft delete support (`deleted_at`)
- Immutable audit trail + row versioning
- Write models optimized for OLTP; reporting offloaded to read replicas/warehouse

## Immediate Enhancements
- Add tenant composite indexes to high-traffic tables:
  - `users (tenant_id, email)`
  - `courses (tenant_id, status)`
  - `inquiries (tenant_id, status, created_at)`
- Add metadata columns:
  - `public_id`, `created_by`, `updated_by`, `deleted_at`
- Add session/auth hardening tables:
  - `user_sessions`, `auth_login_attempts`, `auth_password_resets`, `auth_email_verifications`, `auth_mfa_factors`

## ERP Expansion Tables
- `student_profiles`
- `attendance_records`
- `exam_results`
- `fee_invoices`
- `fee_payments`

## CMS Expansion Tables
- `cms_pages`
- `cms_page_versions`
- `seo_meta`

## Integration and Eventing Tables
- `notifications`, `notification_templates`
- `webhook_endpoints`, `webhook_deliveries`
- `outbox_events`

## Migration Artifact
- Blueprint SQL: [2026_05_24_enterprise_blueprint.sql](/c:/EIILM-JC/database/migrations/2026_05_24_enterprise_blueprint.sql)

## Rollout Strategy
1. Add new nullable columns and new tables (no behavior change)
2. Backfill `public_id`, tenant references, and audit metadata
3. Add constraints and unique indexes after backfill validation
4. Switch API to `public_id` for external contracts
5. Enable strict tenant repository guards and row-level policy checks
