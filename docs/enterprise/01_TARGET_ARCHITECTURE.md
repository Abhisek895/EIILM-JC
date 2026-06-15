# Target Enterprise Architecture

## System Topology
- Multi-tenant SaaS with strict tenant isolation at service and data access layers
- API-first backend with asynchronous workflow orchestration
- Observability-first runtime (logs, metrics, traces, alerts)
- Security by default (least privilege, rotating secrets, defense in depth)

## Reference Folder Structure
```text
EIILM-JC/
  backend/
    src/
      app.ts
      modules/
        <module>/
          controller/
          service/
          repository/
          routes/
          validator/
          dto/
          types/
          events/
          tests/
      shared/
        config/
        middleware/
        security/
        queue/
        cache/
        notifications/
        storage/
        observability/
        utils/
      jobs/
      workers/
      openapi/
    prisma-or-sequelize/
      migrations/
      seeders/
  frontend/
    src/
      app-or-pages/
      modules/
        <module>/
          api/
          components/
          hooks/
          schemas/
          state/
          tests/
      core/
        auth/
        routing/
        permissions/
        ui/
        telemetry/
      shared/
        components/
        lib/
        styles/
  infrastructure/
    docker/
    nginx/
    kubernetes/
      base/
      overlays/
    terraform/
      environments/
        dev/
        staging/
        prod/
    monitoring/
      prometheus/
      grafana/
      otel-collector/
  .github/
    workflows/
      ci.yml
      cd-staging.yml
      cd-production.yml
```

## Deployment Architecture
- CDN + WAF -> Nginx ingress -> Next.js frontend pods -> API gateway/service
- Backend API pods (horizontal autoscaling)
- Redis cluster (cache + BullMQ broker)
- MySQL primary + read replicas
- Object storage (S3/Cloudinary)
- Worker pods for queues, cron jobs, notification dispatch
- Observability stack: OpenTelemetry -> Prometheus/Grafana + Sentry

## Multi-Tenancy Strategy
- Tenant context resolution per request (subdomain, header, or JWT claim)
- Every domain table includes `tenant_id` and tenant-scoped indexes
- Guardrails in repository layer to enforce tenant predicates
- Optional future path: database-per-tenant for premium isolation tiers
