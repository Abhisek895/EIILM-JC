-- ==============================================================================
-- College Management Platform Database Schema (PostgreSQL 14+ / Vercel Postgres)
-- Forensic 10/10 Verification: 100% Column-by-Column Alignment with Sequelize Models
-- ==============================================================================

-- 1. Roles & Permissions (RBAC)
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS permissions (
    id BIGSERIAL PRIMARY KEY,
    module VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    CONSTRAINT uq_module_action UNIQUE (module, action)
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 2. Users (User.ts)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id BIGINT NOT NULL REFERENCES roles(id),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active','inactive','blocked','pending')),
    last_login TIMESTAMP NULL,
    otp_code VARCHAR(6) NULL,
    otp_expires_at TIMESTAMP NULL,
    permissions JSONB NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Colleges (College Info)
CREATE TABLE IF NOT EXISTS colleges (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    logo VARCHAR(512),
    favicon VARCHAR(512),
    email VARCHAR(255),
    phone VARCHAR(100),
    address TEXT,
    about TEXT,
    mission TEXT,
    vision TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Departments (Department.ts)
CREATE TABLE IF NOT EXISTS departments (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    hod_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active','inactive')),
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Courses (Course.ts)
CREATE TABLE IF NOT EXISTS courses (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NULL,
    course_name VARCHAR(255) NOT NULL,
    course_code VARCHAR(100),
    course_type VARCHAR(50) NOT NULL CHECK (course_type IN ('UG','PG','Diploma','Certificate')),
    slug VARCHAR(255) UNIQUE,
    duration VARCHAR(100),
    eligibility TEXT,
    fees TEXT,
    description TEXT,
    banner VARCHAR(512) NULL,
    syllabus VARCHAR(512) NULL,
    specialization VARCHAR(255) NULL,
    show_fees BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Specializations (Specialization.ts)
CREATE TABLE IF NOT EXISTS specializations (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    specialization_name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active','inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Faculty (Faculty.ts)
CREATE TABLE IF NOT EXISTS faculty (
    id BIGSERIAL PRIMARY KEY,
    department_id BIGINT NULL REFERENCES departments(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NULL,
    photo VARCHAR(512) NULL,
    qualification TEXT NULL,
    experience VARCHAR(255) NULL,
    email VARCHAR(255) NULL,
    phone VARCHAR(100) NULL,
    bio TEXT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active','inactive')),
    sort_order INT DEFAULT 0,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Inquiries (Inquiry.ts)
CREATE TABLE IF NOT EXISTS inquiries (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(100) NULL,
    email VARCHAR(255) NULL,
    course_id BIGINT NULL REFERENCES courses(id) ON DELETE SET NULL,
    specialization_id BIGINT NULL,
    city VARCHAR(255) NULL,
    message TEXT,
    source VARCHAR(100) DEFAULT 'website',
    source_name VARCHAR(255) NULL,
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new','contacted','interested','follow_up','converted','rejected','closed','enrolled')),
    assigned_to BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    followup_date DATE NULL,
    notes TEXT,
    first_name VARCHAR(150) NULL,
    last_name VARCHAR(150) NULL,
    gender VARCHAR(50) NULL,
    blood_group VARCHAR(20) NULL,
    caste VARCHAR(50) NULL,
    dob VARCHAR(50) NULL,
    place_of_birth VARCHAR(255) NULL,
    address TEXT NULL,
    state VARCHAR(100) NULL,
    pin VARCHAR(20) NULL,
    alt_phone VARCHAR(50) NULL,
    whatsapp VARCHAR(50) NULL,
    father_name VARCHAR(255) NULL,
    father_occupation VARCHAR(255) NULL,
    mother_name VARCHAR(255) NULL,
    mother_occupation VARCHAR(255) NULL,
    annual_income VARCHAR(100) NULL,
    board_12th VARCHAR(255) NULL,
    stream_12th VARCHAR(100) NULL,
    year_of_passing_12th VARCHAR(50) NULL,
    aggregate_marks_12th VARCHAR(50) NULL,
    school_name VARCHAR(255) NULL,
    mba_college_name VARCHAR(255) NULL,
    mba_degree_name VARCHAR(255) NULL,
    mba_specialization VARCHAR(255) NULL,
    mba_graduation_year VARCHAR(50) NULL,
    mba_university VARCHAR(255) NULL,
    mba_score VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Notices (Notice.ts)
CREATE TABLE IF NOT EXISTS notices (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(512) NULL,
    pdf_url VARCHAR(512) NULL,
    publish_date DATE NULL,
    expiry_date DATE NULL,
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft','published','expired')),
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Events (Event.ts)
CREATE TABLE IF NOT EXISTS events (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    banner VARCHAR(512) NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    location VARCHAR(255) NULL,
    registration_link VARCHAR(512) NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft','published','completed')),
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Media Library (MediaLibrary.ts)
CREATE TABLE IF NOT EXISTS media_library (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NULL,
    file_url VARCHAR(512) NOT NULL,
    uploaded_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    module VARCHAR(100) NULL,
    alt_text VARCHAR(255) NULL,
    tags VARCHAR(255) NULL,
    file_size INT NULL,
    width INT NULL,
    height INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Infrastructures (Infrastructure.ts)
CREATE TABLE IF NOT EXISTS infrastructures (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(512) NULL,
    video_url VARCHAR(512) NULL,
    icon VARCHAR(50) NULL,
    category VARCHAR(50) DEFAULT 'facility' CHECK (category IN ('facility','tour','campus_highlight','hero')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active','inactive','maintenance')),
    sort_order INT DEFAULT 0,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Placements (Placement.ts)
CREATE TABLE IF NOT EXISTS placements (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NULL,
    student_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    company_logo VARCHAR(1000) NULL,
    package VARCHAR(100) NOT NULL,
    year VARCHAR(20) NOT NULL,
    course VARCHAR(255) NULL,
    student_image VARCHAR(1000) NULL,
    placement_type VARCHAR(50) DEFAULT 'placement' CHECK (placement_type IN ('placement','internship')),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Page Sections (PageSection.ts)
CREATE TABLE IF NOT EXISTS page_sections (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NULL,
    page_key VARCHAR(150) NOT NULL,
    section_key VARCHAR(150) NOT NULL,
    sort_order INT DEFAULT 0,
    config JSONB NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active','inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_page_section UNIQUE (page_key, section_key)
);

-- 15. Site Settings (SiteSetting.ts)
CREATE TABLE IF NOT EXISTS site_settings (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NULL,
    key_name VARCHAR(150) NOT NULL,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_key UNIQUE (tenant_id, key_name)
);

-- 16. Chatbot Knowledge Base (ChatKnowledgeBase.ts)
CREATE TABLE IF NOT EXISTS chat_knowledge_base (
    id SERIAL PRIMARY KEY,
    category VARCHAR(255) DEFAULT 'General',
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    keywords TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active','inactive')),
    source VARCHAR(255) DEFAULT 'manual',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 17. Chat Sessions (ChatSession.ts)
CREATE TABLE IF NOT EXISTS chat_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL UNIQUE,
    user_ip VARCHAR(255),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 18. Chat Messages (ChatMessage.ts)
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('user','assistant','system')),
    message TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 19. Grades (Grade.ts)
CREATE TABLE IF NOT EXISTS grades (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    semester VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    grade VARCHAR(10) NOT NULL,
    credits INT NOT NULL,
    status VARCHAR(50) DEFAULT 'Pass' CHECK (status IN ('Pass','Fail','Pending')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 20. Fee Records (FeeRecord.ts)
CREATE TABLE IF NOT EXISTS fee_records (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Paid','Pending','Overdue')),
    receipt_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 21. Page Views (PageView.ts)
CREATE TABLE IF NOT EXISTS page_views (
    id BIGSERIAL PRIMARY KEY,
    path VARCHAR(255) NOT NULL,
    user_agent VARCHAR(255) NULL,
    ip_address VARCHAR(100) NULL,
    country VARCHAR(50) NULL,
    region VARCHAR(100) NULL,
    city VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 22. Audit Logs (AuditLog.ts)
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NULL,
    user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(45),
    user_agent VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
