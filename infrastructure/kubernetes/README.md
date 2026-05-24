# Kubernetes Manifests

## Base Resources
- backend deployment/service
- frontend deployment/service
- worker deployment
- ingress

## Recommended Next Steps
1. Add `kustomization.yaml` for base + overlays (`dev`, `staging`, `prod`)
2. Add HPA resources and PodDisruptionBudgets
3. Add CronJobs for scheduled workflows
4. Add ExternalSecrets or CSI driver for secret management
