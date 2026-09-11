# Production Remediation Plan

This remediation plan addresses the verified defects identified during the zero-trust independent production audit.

---

## Remediation Roadmap

### 1. 🔴 Critical Priority: Production Database Schema Synchronization (`CRIT-01`)
- **File**: `database/schema.sql`
- **Action**:
  1. Add all 28 missing application form fields to `inquiries`:
     - `first_name`, `last_name`, `gender`, `blood_group`, `caste`, `dob`, `place_of_birth`, `address`, `state`, `pin`, `alt_phone`, `whatsapp`, `father_name`, `father_occupation`, `mother_name`, `mother_occupation`, `annual_income`, `board_12th`, `stream_12th`, `year_of_passing_12th`, `aggregate_marks_12th`, `school_name`, `mba_college_name`, `mba_degree_name`, `mba_specialization`, `mba_graduation_year`, `mba_university`, `mba_score`, `source_name`.
     - Update `status` ENUM to include `'enrolled'`.
  2. Add `show_fees BOOLEAN DEFAULT TRUE` to `courses`.
  3. Add `'pending'` to `users.status` ENUM.
  4. Add `deleted_at TIMESTAMP NULL` to `events` table (matching Sequelize `paranoid: true`).
  5. Add `file_size INT NULL`, `width INT NULL`, `height INT NULL` to `media_library`.
  6. Update `placements.year` from `VARCHAR(4)` to `VARCHAR(20)`.
  7. Align `departments`: Add `hod_id BIGINT NULL` (foreign key to `users(id)`) and `deleted_at TIMESTAMP NULL`.
- **Verification**: Run SQL schema syntax check and cross-reference with all Sequelize models.

### 2. 🔴 Critical Priority: Docker Configuration Hardening (`CRIT-02`)
- **Files**: `frontend/dockerfile`, `docker-compose.yml`
- **Action**:
  1. In `frontend/dockerfile`, add `COPY --from=builder /app/next.config.mjs ./next.config.mjs` in the production runner stage.
  2. Remove obsolete `version: '3.8'` from `docker-compose.yml`.
- **Verification**: Run `docker compose config`.

### 3. 🟠 High Priority: Frontend Image Configuration & Port Alignment (`HIGH-03`)
- **File**: `frontend/next.config.mjs`
- **Action**:
  1. Update `images.remotePatterns` to allow `localhost:5000` and `localhost:5001` (where uploaded assets are served).
  2. Remove hardcoded private IP `10.242.209.210`.
  3. Set fallback `NEXT_PUBLIC_API_URL` to `http://localhost:5000/api/v1`.
- **Verification**: Run `npm run build` in `frontend`.

### 4. 🟠 High Priority: Replace Synthetic Frontend RBAC Test (`HIGH-01`)
- **File**: `frontend/src/__tests__/rbac.test.ts`
- **Action**:
  1. Replace the local mock function `canAccessModule` with tests verifying real application routing and role evaluation logic (e.g. role-based dashboard redirects, permission checks, and token handling).
- **Verification**: Run `npm test` in `frontend`.

### 5. 🟠 High Priority: Production Secret Safeguards (`HIGH-04`)
- **File**: `backend/src/config/environment.ts`
- **Action**:
  1. Add runtime check in `Config`: In `production` environment (`NODE_ENV === 'production'`), throw an explicit startup error if `JWT_SECRET` equals the default fallback key or is unset.
  2. Align default port in `environment.ts` to `5000` (matching `app.ts` and `docker-compose.yml`).
- **Verification**: Run `npm run build` in `backend`.

### 6. 🟡 Medium Priority: Fix API Client 429 Handling (`MED-01`)
- **File**: `frontend/src/api/apiClient.ts`
- **Action**:
  1. On HTTP 429 status code, throw an explicit `ApiError` with rate limit message rather than returning `{ data: null }` resolved as successful `T`.
- **Verification**: Verify client error propagation in tests.

### 7. 🔵 Low Priority: Remove Authentication `console.log` Residuals (`LOW-01`)
- **Files**: `backend/src/controllers/AuthController.ts`, `backend/src/services/UserService.ts`
- **Action**:
  1. Clean up residual `console.log` statements in login and authentication methods.
- **Verification**: Run backend tests and verify clean logs.
