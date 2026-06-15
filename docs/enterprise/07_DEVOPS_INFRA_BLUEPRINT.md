# DevOps and Infrastructure Blueprint

## Runtime Stack
- Nginx ingress with TLS termination
- Next.js service and API service as separate workloads
- Worker deployment for BullMQ queues
- CronJob resources for scheduled tasks
- Redis (cache + queue broker)
- MySQL primary with read replicas

## Container Strategy
- Multi-stage Docker builds
- Distroless/alpine runtime images
- Non-root user and read-only filesystem where possible
- Health and readiness probes

## Kubernetes Baseline
- Namespaces per environment: `dev`, `staging`, `prod`
- HorizontalPodAutoscaler for API/frontend/workers
- PodDisruptionBudget for critical services
- ConfigMap + Secret separation
- NetworkPolicy for service communication boundaries

## Terraform Scope
- VPC, subnets, NAT, security groups
- Managed Kubernetes and managed MySQL/Redis
- Object storage buckets + CDN distributions
- IAM roles for workload identities
- Monitoring and alerting infrastructure

## Deployment Strategy
- Blue-green for API and frontend
- Database migrations gated as pre-release step
- Automated rollback with health signal checks
