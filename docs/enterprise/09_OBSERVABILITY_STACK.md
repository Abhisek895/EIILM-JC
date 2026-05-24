# Observability and Monitoring Architecture

## Signals
- Logs: structured JSON with correlation and tenant fields
- Metrics: RED + USE method metrics
- Traces: distributed tracing across frontend, API, and worker chain

## Stack
- Sentry: frontend + backend error telemetry
- OpenTelemetry SDK + collector
- Prometheus for metrics storage
- Grafana dashboards and alerting

## Required Dimensions
- `tenant_id`
- `user_id` (when authenticated)
- `correlation_id`
- `module`
- `endpoint`
- `job_name` for async workloads

## Golden Dashboards
- API latency p50/p95/p99 by module
- Error rate by endpoint and tenant
- Queue lag and retry backlog
- Auth failures and suspicious login trends
- DB saturation and replica lag

## Health Endpoints
- `/health/live`
- `/health/ready`
- `/health/dependencies` (db, redis, queue, storage)
