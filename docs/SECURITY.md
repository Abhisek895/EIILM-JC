# Security Architecture & Hardening Guide

## 1. Authentication Security
- **Algorithm**: Industry standard HMAC-SHA256 JWT tokens.
- **Access Tokens**: Short-lived (default 24h) containing minimum user metadata (`id`, `email`, `roleId`, `role`, `tenantId`, `permissions`).
- **Refresh Tokens**: Long-lived (default 7d) signed with a separate secret (`JWT_REFRESH_SECRET`). Rotation is supported with request queueing in `apiClient.ts` to prevent race conditions during parallel asset requests.
- **Password Hashing**: `bcryptjs` using salt rounds = 10. Centralized in `User.ts` hooks (`beforeCreate`, `beforeUpdate`). Single-hash enforcement ensures passwords are never hashed multiple times.
- **OTP Generation**: Cryptographically secure random 6-digit numeric codes generated using `crypto.randomInt(100000, 1000000)`. Stored with an explicit 10-minute expiry timestamp.
- **Account Setup Tokens**: Single-purpose JWTs with `{ purpose: 'setup_password' }` and 24-hour expiration for administrative invitations.

---

## 2. Authorization & RBAC
- **Hierarchy**:
  ```text
  super_admin (Full platform authority; overrides all checks)
      ↓
  admin (College administration; module-level read/write/delete)
      ↓
  faculty (Teaching staff; academic modules read-only or graded access)
      ↓
  student (Enrolled student; strictly scoped to self records in /student)
  ```
- **Authoritative Resolution**: Client-supplied `roleId` and `roleName` parameters are NEVER trusted from public requests. Public registration (`/auth/register`) enforces `role: 'student'`.
- **Privilege Escalation Controls**:
  - In `UserController`, creating or modifying an account with `roleId <= 2` (`super_admin` or `admin`) strictly requires `req.user.role === 'super_admin'`.
  - Admins cannot grant permissions that they themselves do not possess.
  - Self-deletion is prohibited (`req.user.id === targetId`).
  - No personal email addresses are hardcoded for authorization.

---

## 3. Multi-Tenant Security
- **Tenant Scope**: Tenant context is derived strictly from verified JWT tokens (`req.user.tenantId`) or authenticated session context.
- **Database Isolation**: Models define `tenantId: DataTypes.BIGINT, allowNull: true, field: 'tenant_id'`. Queries for tenant-owned resources are scoped by `tenant_id`. Super administrators operate with platform-wide visibility (`tenantId: null`).
- **Untrusted Input Rejection**: Client-supplied tenant IDs in request bodies are ignored in favor of the authenticated user's token.

---

## 4. Chatbot Security
- **Public vs. Protected Separation**:
  - `POST /api/v1/chatbot/chat`: Publicly accessible for prospective students and visitors.
  - `GET /api/v1/chatbot/knowledge`, `POST /api/v1/chatbot/knowledge`, `DELETE /api/v1/chatbot/knowledge/:id`: Strictly protected by `authenticateToken` and `authorizeRole(['admin', 'super_admin'])`.
  - `POST /api/v1/chatbot/upload`: Strictly protected by admin authorization. Multer enforces 10MB limits and verifies MIME types (`application/pdf`, `.docx`, `text/plain`).
  - Temporary files are guaranteed to be unlinked in `finally` blocks, preventing disk exhaustion.
  - `GET /api/v1/chatbot/analytics`: Strictly admin protected.

---

## 5. File Upload Security
- **Engine**: Smart hybrid storage (`uploadCloud.ts`) automatically switches between Cloudinary CDN (production) and local disk storage (`uploads/files/`).
- **Path Traversal Protection**: Filenames are sanitized via `basename.toLowerCase().replace(/[^a-z0-9_-]/g, '_')` and unique timestamps.
- **Extension & MIME Whitelist**:
  - Allowed: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.avif`, `.mp4`, `.webm`, `.pdf`, `.doc`, `.docx`, `.txt`.
  - Blocked: Executable/script files (`.exe`, `.sh`, `.bat`, `.cmd`, `.php`, `.html`, `.svg`, `.js`, `.cgi`) to eliminate stored XSS and remote code execution risks.
- **File Size Limit**: Capped at 50 MB for media; 10 MB for chatbot documents.

---

## 6. HTTP & Network Security
- **Helmet**: Secures HTTP headers (`X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `X-XSS-Protection`). `crossOriginResourcePolicy` is configured to allow asset loading by the frontend.
- **CORS Whitelist**: Never uses wildcard `origin: true` with credentials in production. Restricts requests to `allowedOrigins` (`FRONTEND_URL` and approved domains).
- **Rate Limiting**: `express-rate-limit` prevents brute-force login attempts and denial-of-service on `/api/*`.
- **Non-blocking Logging**: Blocking `fs.appendFileSync` disk calls replaced with asynchronous streams and stdout. Sensitive fields (`password`, `token`, `secret`, `otpCode`, `authorization`) are automatically redacted before logging.
