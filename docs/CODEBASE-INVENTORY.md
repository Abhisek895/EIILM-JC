# Codebase Inventory: EIILM Kolkata Jalpaiguri Campus ERP

> Verified against active implementation as of September 2026.

## 1. System Architecture Overview
The platform is organized as a decoupled full-stack TypeScript monolith containing:
- **Backend**: Express.js, TypeScript (`tsc` + `tsc-alias`), Sequelize ORM, MySQL 8.0, JWT Authentication, Role & Granular RBAC, Multer (Local Disk / Cloudinary CDN), Winston / non-blocking stream logging.
- **Frontend**: Next.js 14 (Pages router), React 18, TypeScript, Tailwind CSS, Lucide React, Framer Motion, dynamic ExcelJS export, and Axios API Client.
- **Database**: Relational MySQL 8.0 schema (`database/schema.sql`) with 21 active Sequelize models and referential integrity constraints.

---

## 2. Backend Modules & Directory Structure

```text
backend/
├── src/
│   ├── app.ts                         # Main Express application entrypoint
│   ├── config/
│   │   ├── database.ts                # Sequelize MySQL connection pool
│   │   └── environment.ts             # Typed environment variable loader & validator
│   ├── controllers/
│   │   ├── AuthController.ts          # Register, Login, Refresh, OTP, Setup Password
│   │   ├── CourseController.ts        # Course CRUD + dual ID/slug resolution
│   │   ├── DashboardController.ts     # Analytics, KPI stats, PageView tracker
│   │   ├── InquiryController.ts       # CRM Leads & Status Workflow
│   │   ├── UserController.ts          # User CRUD + RBAC protection
│   │   ├── StudentController.ts       # Grades, Fees, Student Profile
│   │   └── ChatbotController.ts       # Public Chat, Admin Knowledge Base & Uploads
│   ├── middlewares/
│   │   ├── auth.ts                    # JWT validation, authorizeRole, authorizePermission
│   │   ├── correlationId.ts           # X-Correlation-ID request tracking
│   │   ├── errorHandler.ts            # Centralized API error response handler
│   │   ├── requestLogger.ts           # Non-blocking HTTP request logger
│   │   └── uploadCloud.ts             # Smart upload middleware (Local fallback / Cloudinary)
│   ├── models/
│   │   ├── index.ts                   # Central source of truth for Sequelize associations
│   │   ├── User.ts                    # User entity + bcrypt beforeCreate/beforeUpdate hooks
│   │   ├── Role.ts                    # RBAC Roles (super_admin, admin, faculty, student)
│   │   ├── Course.ts                  # Academic courses
│   │   ├── Department.ts              # College departments
│   │   ├── Faculty.ts                 # Faculty profiles
│   │   ├── Inquiry.ts                 # Admission inquiries / CRM leads
│   │   ├── Notice.ts                  # Notice board announcements
│   │   ├── Event.ts                   # College campus events
│   │   ├── MediaLibrary.ts            # Uploaded asset registry
│   │   ├── Infrastructure.ts          # Campus infrastructure highlights
│   │   ├── Placement.ts               # Student placement records
│   │   ├── PageSection.ts             # CMS page sections
│   │   ├── SiteSetting.ts             # Global key-value configurations
│   │   ├── PageView.ts                # Anonymous visitor traffic tracking
│   │   ├── ChatKnowledgeBase.ts       # AI Chatbot FAQ knowledge chunks
│   │   ├── ChatSession.ts             # Chatbot active user sessions
│   │   ├── ChatMessage.ts             # Chatbot message history
│   │   ├── Grade.ts                   # Student academic grades
│   │   └── FeeRecord.ts               # Student tuition fee invoices
│   ├── modules/                       # Domain-driven feature modules
│   │   ├── departments/               # Department controller, service, repository, routes
│   │   ├── faculty/                   # Faculty controller, service, repository, routes
│   │   ├── notices/                   # Notice board controller, service, repository, routes
│   │   ├── events/                    # Event management controller, service, repository, routes
│   │   ├── site-settings/             # Dynamic CMS settings repository and service
│   │   ├── cms-page-builder/          # Page section CMS builder
│   │   └── infrastructures/           # Infrastructure CRUD and gallery
│   ├── repositories/
│   │   ├── BaseRepository.ts          # Generic CRUD repository with pagination
│   │   ├── UserRepository.ts          # User queries with associations
│   │   ├── RoleRepository.ts          # Role lookups
│   │   └── CourseRepository.ts        # Filtered course search with Op.substring
│   ├── routes/
│   │   ├── chatbotRoutes.ts           # Chatbot public chat & protected admin knowledge routes
│   │   └── v1/
│   │       ├── index.ts               # API v1 central router
│   │       ├── auth.ts                # Auth endpoints
│   │       ├── users.ts               # User management
│   │       ├── courses.ts             # Course endpoints
│   │       ├── dashboard.ts           # Stats and analytics
│   │       ├── inquiries.ts           # CRM endpoints
│   │       ├── media.ts               # File upload and asset registry
│   │       ├── student.ts             # Student portal data
│   │       └── placementRoutes.ts     # Placement records
│   ├── scripts/
│   │   ├── seed.ts                    # Deterministic, single-hash database seeder
│   │   └── sync_db.ts                 # Safe schema synchronization script
│   └── utils/
│       ├── logger.ts                  # Non-blocking asynchronous streams + secret redaction
│       ├── responses.ts               # Standardized ApiResponse helper
│       └── pagination.ts              # Sanitized pagination parser
```

---

## 3. Frontend Pages & Routing Structure

```text
frontend/
├── src/
│   ├── api/
│   │   ├── apiClient.ts               # Axios client with auto-refresh queue & proper error surfacing
│   │   └── endpoints.ts               # Fully typed API domain functions
│   ├── hooks/
│   │   ├── useAuth.ts                 # React authentication context hook
│   │   └── usePermissions.ts          # Granular module permission evaluator
│   ├── layouts/
│   │   ├── MainLayout.tsx             # Public portal navigation & footer
│   │   └── DashboardLayout.tsx        # ERP Admin/Faculty responsive sidebar & header
│   ├── pages/
│   │   ├── index.tsx                  # Public homepage with hero, courses, notices, slider
│   │   ├── about.tsx                  # About the institution, leadership, mission & vision
│   │   ├── admissions.tsx             # Admission guidelines and inquiry form
│   │   ├── contact.tsx                # Campus location, map, phone & contact form
│   │   ├── courses/                   # Academic program listings & course detail pages
│   │   ├── departments/               # Department overview & department slug pages
│   │   ├── faculty/                   # Faculty directory & faculty profile pages
│   │   ├── notices.tsx                # Public college notice board
│   │   ├── events.tsx                 # Campus events and seminars
│   │   ├── infrastructure.tsx         # Campus facilities, labs, library, hostel
│   │   ├── placements.tsx             # Placement statistics & recruiter marquee
│   │   ├── auth/
│   │   │   ├── login.tsx              # Role-aware login (redirects student vs admin/faculty)
│   │   │   ├── register.tsx           # Public student self-registration
│   │   │   ├── forgot-password.tsx    # OTP password recovery
│   │   │   └── setup-password.tsx     # Admin invitation token password setup
│   │   ├── dashboard/                 # Admin & Faculty management portal
│   │   │   ├── index.tsx              # Analytics overview & quick stats
│   │   │   ├── courses/               # Course catalog management
│   │   │   ├── departments/           # Department management
│   │   │   ├── faculty/               # Faculty staff management
│   │   │   ├── inquiries/             # CRM inquiry pipeline + dynamic ExcelJS export
│   │   │   ├── notices/               # Notice board publication
│   │   │   ├── events/                # Event creation & scheduling
│   │   │   ├── media/                 # Cloudinary / local media library
│   │   │   ├── placements/            # Placement record management
│   │   │   ├── settings/              # Dynamic CMS key-value configuration
│   │   │   ├── users/                 # User management & granular RBAC assigner
│   │   │   └── chatbot/               # AI knowledge base curation & training
│   │   └── student/                   # Student dedicated portal
│   │       ├── index.tsx              # Student dashboard & announcements
│   │       ├── fees.tsx               # Tuition fee invoices & receipts
│   │       └── grades.tsx             # Semester grade report
│   └── utils/
│       └── getImageUrl.ts             # Port 5000-aware absolute URL resolver
```
