# Troubleshooting & Operations Guide

## 1. Port Already in Use (EADDRINUSE)
- **Symptom**: `Error: listen EADDRINUSE: address already in use :::5000`
- **Cause**: An existing backend process is already running on port 5000 or 5001.
- **Resolution**:
  - Windows:
    ```powershell
    netstat -ano | findstr :5000
    taskkill /PID <PID> /F
    ```
  - Linux / macOS:
    ```bash
    lsof -i :5000
    kill -9 <PID>
    ```

---

## 2. Path Alias Resolution Failure (`MODULE_NOT_FOUND`)
- **Symptom**: `Cannot find module '@config/database'` when running `node dist/app.js`.
- **Cause**: Plain `tsc` transpilation outputs `@...` paths verbatim without rewriting them to relative paths.
- **Resolution**:
  Verify `backend/package.json` build script uses `tsc-alias`:
  ```json
  "build": "tsc && tsc-alias"
  ```
  Run `npm run build` in `backend` before starting `node dist/app.js`.

---

## 3. Database Connection Failure
- **Symptom**: `SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:3306`
- **Resolution**:
  1. Confirm MySQL service is running:
     - Windows: `Get-Service MySQL80`
     - Linux: `systemctl status mysql`
  2. Verify credentials in `backend/.env` (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).
  3. Ensure database `eiilm_college` exists:
     ```sql
     CREATE DATABASE IF NOT EXISTS eiilm_college;
     ```

---

## 4. CORS Blocked Origin
- **Symptom**: Browser console error: `Access to XMLHttpRequest at 'http://localhost:5000/api/v1/...' from origin 'http://localhost:3000' has been blocked by CORS policy`.
- **Resolution**:
  1. Inspect `FRONTEND_URL` in `backend/.env`.
  2. In production, comma-separate allowed origins:
     ```env
     FRONTEND_URL=https://yourdomain.com,https://www.yourdomain.com
     ```
  3. In development, localhost and 127.0.0.1 are automatically permitted.

---

## 5. Seed Script Double Hashing / Login Failure
- **Symptom**: `authenticateUser` returns 401 Invalid Credentials after seeding.
- **Cause**: Password was pre-hashed with bcrypt prior to calling `User.create()`, which triggered `User.beforeCreate` to hash it a second time.
- **Resolution**:
  Ensure `backend/src/scripts/seed.ts` passes the raw password (e.g. `'Admin@123'`). Run `npm run seed` in `backend` to reset the password hash correctly.

---

## 6. File Upload Rejections
- **Symptom**: `File upload rejected: dangerous or executable file extension detected.`
- **Cause**: Uploading `.exe`, `.html`, `.svg`, `.js`, or `.sh` files is prohibited to protect against stored XSS and remote execution.
- **Resolution**:
  Only upload supported media types (`.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.mp4`, `.pdf`, `.docx`).
