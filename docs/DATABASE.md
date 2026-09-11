# Database Architecture & Schema Documentation

## 1. Overview
The database layer is built on **MySQL 8.0** managed via **Sequelize ORM** in TypeScript. All associations and foreign key constraints are enforced with referential integrity.

---

## 2. Table Catalog

| Table Name | Primary Key | Purpose | Key Foreign Keys |
| :--- | :--- | :--- | :--- |
| `roles` | `id` (BIGINT) | System role definitions | None |
| `permissions` | `id` (BIGINT) | Module action definitions | None |
| `role_permissions` | `(role_id, permission_id)` | Role-to-permission mapping | `role_id` → `roles`, `permission_id` → `permissions` |
| `users` | `id` (BIGINT) | Accounts (Admin, Faculty, Student) | `role_id` → `roles` |
| `colleges` | `id` (BIGINT) | Institution profile & metadata | None |
| `departments` | `id` (BIGINT) | Academic departments | None |
| `faculty` | `id` (BIGINT) | Faculty profiles & qualifications | `department_id` → `departments` |
| `courses` | `id` (BIGINT) | Academic programs (UG, PG, etc.) | None |
| `specializations` | `id` (BIGINT) | Course specializations | `course_id` → `courses` |
| `syllabi` | `id` (BIGINT) | Course semester syllabi documents | `course_id` → `courses` |
| `inquiries` | `id` (BIGINT) | CRM Admission leads | `course_id` → `courses`, `assigned_to` → `users` |
| `notices` | `id` (BIGINT) | College notice announcements | None |
| `events` | `id` (BIGINT) | Campus events & webinars | None |
| `media_library` | `id` (BIGINT) | Uploaded media asset registry | `uploaded_by` → `users` |
| `audit_logs` | `id` (BIGINT) | Security and mutation audit trail | `user_id` → `users` |
| `site_settings` | `id` (BIGINT) | Dynamic CMS key-value store | None |
| `page_sections` | `id` (BIGINT) | Visual page builder section data | None |
| `form_definitions` | `id` (BIGINT) | Custom form schemas | None |
| `form_submissions` | `id` (BIGINT) | Form entry responses | `form_id` → `form_definitions` |
| `infrastructures` | `id` (BIGINT) | Campus facilities & virtual tours | None |
| `placements` | `id` (BIGINT) | Student placements & company packages | None |
| `page_views` | `id` (BIGINT) | Anonymous geo-located visitor logs | None |
| `chat_knowledge_base`| `id` (INT) | Knowledge base for AI chatbot | None (FULLTEXT on question, answer, keywords) |
| `chat_sessions` | `id` (INT) | Chatbot visitor sessions | None |
| `chat_messages` | `id` (INT) | History of AI & visitor messages | None |
| `grades` | `id` (BIGINT) | Student semester grades | `student_id` → `users` |
| `fee_records` | `id` (BIGINT) | Student fee invoices & receipts | `student_id` → `users` |

---

## 3. Referential Integrity Rules
- **Foreign Keys**: Enabled at all times. The system NEVER runs `SET FOREIGN_KEY_CHECKS = 0`.
- **Cascade Behavior**:
  - Dependent child records that cannot exist without a parent (e.g., `specializations`, `grades`, `fee_records`) use `ON DELETE CASCADE`.
  - Auditing and operational records (e.g., `media_library.uploaded_by`, `audit_logs.user_id`, `inquiries.assigned_to`) use `ON DELETE SET NULL`.
- **Soft Deletes**:
  - Supported on `faculty`, `departments`, `infrastructures` via Sequelize `paranoid: true` (`deleted_at`).

---

## 4. Chatbot Full-Text Search
The `chat_knowledge_base` table features a dedicated FULLTEXT index:
```sql
FULLTEXT KEY ft_chat_knowledge (question, answer, keywords)
```
This enables high-performance natural language queries:
```sql
SELECT * FROM chat_knowledge_base
WHERE MATCH(question, answer, keywords) AGAINST(? IN NATURAL LANGUAGE MODE)
AND status = 'active'
LIMIT 3;
```

---

## 5. Seed System
- **Script**: `backend/src/scripts/seed.ts`
- **Execution**: `npm run seed` (invokes `ts-node src/scripts/seed.ts`)
- **Seeded Accounts**:
  - Super Admin: `superadmin@eiilm.edu` / `SuperAdmin@123`
  - Admin: `admin@eiilm.edu` / `Admin@123`
  - Faculty: `faculty@eiilm.edu` / `Faculty@123`
  - Student: `student@eiilm.edu` / `Student@123`
- Passwords are provided in plain text and hashed once via Sequelize model hooks.
