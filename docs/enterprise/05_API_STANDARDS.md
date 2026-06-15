# API Standards and Conventions

## Versioning
- Path versioning: `/api/v1/...`
- Breaking changes only in major version (`v2`)
- Sunset policy documented per endpoint group

## Request/Response Contract
- Correlation headers:
  - `x-correlation-id` (required/generated)
  - `x-tenant-id` (when not derived from host)
- Success envelope:
```json
{
  "success": true,
  "message": "string",
  "data": {}
}
```
- Error envelope:
```json
{
  "success": false,
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "Invalid credentials",
    "details": null
  },
  "correlationId": "uuid"
}
```

## Pagination
- Query: `page`, `limit`, `sort`, `order`
- Response includes `pagination` object with total, page, limit, totalPages

## Auth and Tenant Context
- Access token short TTL
- Rotating refresh token long TTL with session linkage
- Tenant enforced at service/repository boundaries

## OpenAPI
- Each module owns its spec fragment
- Merge to generated docs at build time
- Contract tests assert OpenAPI and runtime parity
