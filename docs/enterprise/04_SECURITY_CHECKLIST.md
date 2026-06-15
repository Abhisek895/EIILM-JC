# Enterprise Security Checklist

## Identity and Access
- Refresh token rotation with reuse-detection
- Device/session registry and remote sign-out
- Token revocation list (Redis + persistent fallback)
- MFA (TOTP) enrollment and recovery flow
- Email verification enforcement before privileged actions
- Password reset with single-use expiring tokens
- Login attempt throttling per email/IP/device

## Authorization
- Tenant-aware RBAC with role + permission matrices
- Dynamic permission evaluation for resource ownership
- Permission cache in Redis with event-based invalidation
- Admin override actions fully audit-logged

## API and App Security
- Correlation ID on every request
- Input validation with strict schemas
- Centralized error responses (no stack leaks in prod)
- Standardized rate limits by route class
- Idempotency keys for write endpoints

## Data Security
- TLS everywhere (edge and service-to-service where applicable)
- At-rest encryption for backups and storage buckets
- Field-level encryption for sensitive secrets
- Secrets from vault/secret manager only, never from code

## Infrastructure Security
- Non-root containers
- SBOM + image scanning in CI
- Network policy for pod-to-pod access
- WAF rules at ingress/CDN
- Least privilege IAM for workers and storage adapters

## Compliance and Audit
- Immutable audit logs with actor, action, before/after payload hashes
- Access logs retained per policy
- Incident response runbook and escalation matrix
