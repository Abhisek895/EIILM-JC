# Terraform Blueprint

## Scope
- Networking (VPC/subnets/routing/security groups)
- Kubernetes cluster
- Managed MySQL and Redis
- Object storage + CDN
- Observability infrastructure
- IAM roles and workload identities

## Environment Layout
```text
terraform/
  environments/
    dev/
    staging/
    prod/
  modules/
    network/
    kubernetes/
    database/
    cache/
    storage/
    monitoring/
```

## Recommended Flow
1. `terraform plan` in environment folder
2. PR review and policy checks
3. `terraform apply` through CI with approval gate
