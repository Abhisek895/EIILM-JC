# CI/CD Architecture

## CI Pipeline Stages
1. Dependency install + cache restore
2. Lint + typecheck
3. Unit/integration tests
4. Build backend and frontend artifacts
5. Security scans (SAST, dependency, container)
6. Publish artifacts and Docker images

## CD Pipeline Stages
1. Deploy to staging namespace
2. Run migrations (safe mode + lock)
3. Run smoke tests
4. Manual approval gate for production
5. Blue-green production deployment
6. Post-deploy checks and automatic rollback if failed

## Required Workflow Files
- `.github/workflows/ci.yml`
- `.github/workflows/cd-staging.yml`
- `.github/workflows/cd-production.yml`

## Secrets and Environment Management
- GitHub OIDC -> cloud IAM role assumption
- Secret manager as single source of truth
- Per-environment encrypted variables
