# Production Deployment & Operations Guide

## 1. Prerequisites
- **Node.js**: `v20.x` or `v18.x` LTS
- **Package Manager**: `npm` v9+
- **Database**: MySQL 8.0+
- **Containerization (Optional)**: Docker & Docker Compose v2+

---

## 2. Option A: Docker Compose Deployment (Recommended)

### Step 1: Environment Configuration
Ensure root `docker-compose.yml` matches your desired production environment variables.

### Step 2: Build and Start Containers
```bash
docker compose build
docker compose up -d
```

### Step 3: Run Seed Data (First Run Only)
```bash
docker compose exec backend npm run seed
```

### Step 4: Verify Services
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api/v1`
- Health Check: `http://localhost:5000/health` (HTTP 200 OK)

---

## 3. Option B: Bare Metal / VM Deployment (Ubuntu / Windows / VPS)

### Step 1: Database Setup
1. Create MySQL database:
   ```sql
   CREATE DATABASE eiilm_college CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Import schema:
   ```bash
   mysql -u root -p eiilm_college < database/schema.sql
   ```

### Step 2: Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials and production secrets

npm ci
npm run build
npm run seed
npm start
```
*Note: For process management in production, use PM2:*
```bash
npm install -g pm2
pm2 start dist/app.js --name "college-erp-backend"
```

### Step 3: Frontend Setup
```bash
cd frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1

npm ci
npm run build
npm start
```
*Note: In PM2:*
```bash
pm2 start npm --name "college-erp-frontend" -- start
```

---

## 4. NGINX Reverse Proxy Configuration

```nginx
# /etc/nginx/sites-available/college-erp.conf

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend Web Application
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 5. Pre-Flight Production Checklist
- [ ] `NODE_ENV=production` is set in backend environment.
- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` are replaced with unique, cryptographically random 64-character strings.
- [ ] `FRONTEND_URL` is set to the exact production frontend domain to lock down CORS.
- [ ] Database user has scoped permissions on the specific database.
- [ ] Default passwords for seeded accounts are changed upon initial login.
- [ ] SSL certificates (e.g. Let's Encrypt Certbot) installed on NGINX.
