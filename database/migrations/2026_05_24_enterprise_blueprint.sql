-- Enterprise SaaS Schema Evolution Blueprint
-- Note: This file is a migration design baseline. Validate in staging before production rollout.

-- ---------------------------------------------------------------------
-- Core multi-tenant upgrades
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS tenants (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    public_id CHAR(36) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    status ENUM('active','suspended','archived') DEFAULT 'active',
    plan_code VARCHAR(100) DEFAULT 'starter',
    timezone VARCHAR(100) DEFAULT 'Asia/Kolkata',
    locale VARCHAR(20) DEFAULT 'en-IN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL
);

ALTER TABLE users
    ADD COLUMN public_id CHAR(36) NULL,
    ADD COLUMN deleted_at DATETIME NULL,
    ADD COLUMN created_by BIGINT NULL,
    ADD COLUMN updated_by BIGINT NULL;

CREATE INDEX idx_users_tenant_status ON users (tenant_id, status);
CREATE INDEX idx_users_email_tenant ON users (email, tenant_id);
CREATE UNIQUE INDEX uq_users_public_id ON users (public_id);

ALTER TABLE courses
    ADD COLUMN public_id CHAR(36) NULL,
    ADD COLUMN deleted_at DATETIME NULL,
    ADD COLUMN created_by BIGINT NULL,
    ADD COLUMN updated_by BIGINT NULL;

CREATE INDEX idx_courses_tenant_status ON courses (tenant_id, status);
CREATE UNIQUE INDEX uq_courses_public_id ON courses (public_id);

ALTER TABLE inquiries
    ADD COLUMN public_id CHAR(36) NULL,
    ADD COLUMN deleted_at DATETIME NULL,
    ADD COLUMN created_by BIGINT NULL,
    ADD COLUMN updated_by BIGINT NULL;

CREATE INDEX idx_inquiries_tenant_status ON inquiries (tenant_id, status);
CREATE INDEX idx_inquiries_created_at ON inquiries (created_at);
CREATE UNIQUE INDEX uq_inquiries_public_id ON inquiries (public_id);

-- ---------------------------------------------------------------------
-- Authentication and session management
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    public_id CHAR(36) NOT NULL UNIQUE,
    tenant_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    user_agent TEXT,
    ip_address VARCHAR(100),
    refresh_token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    revoked_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_user_sessions_user ON user_sessions (user_id, revoked_at, expires_at);
CREATE INDEX idx_user_sessions_tenant ON user_sessions (tenant_id, user_id);

CREATE TABLE IF NOT EXISTS auth_login_attempts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NULL,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(100) NULL,
    success TINYINT(1) NOT NULL DEFAULT 0,
    reason_code VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE INDEX idx_login_attempts_email_created ON auth_login_attempts (email, created_at);
CREATE INDEX idx_login_attempts_ip_created ON auth_login_attempts (ip_address, created_at);

CREATE TABLE IF NOT EXISTS auth_password_resets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS auth_email_verifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    verified_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS auth_mfa_factors (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    type ENUM('totp','sms','email','backup_code') NOT NULL,
    secret_encrypted TEXT NULL,
    is_primary TINYINT(1) DEFAULT 0,
    is_verified TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ---------------------------------------------------------------------
-- Notifications and integrations
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS notification_templates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NOT NULL,
    channel ENUM('email','sms','push','in_app','webhook') NOT NULL,
    template_key VARCHAR(150) NOT NULL,
    subject VARCHAR(255) NULL,
    body TEXT NOT NULL,
    locale VARCHAR(20) DEFAULT 'en-IN',
    status ENUM('active','inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_template_tenant_channel_key (tenant_id, channel, template_key),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    public_id CHAR(36) NOT NULL UNIQUE,
    tenant_id BIGINT NOT NULL,
    user_id BIGINT NULL,
    channel ENUM('email','sms','push','in_app','webhook') NOT NULL,
    template_key VARCHAR(150) NULL,
    payload JSON,
    status ENUM('queued','sent','failed','delivered') DEFAULT 'queued',
    sent_at DATETIME NULL,
    failure_reason TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_notifications_tenant_status ON notifications (tenant_id, status, created_at);

CREATE TABLE IF NOT EXISTS webhook_endpoints (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    target_url VARCHAR(512) NOT NULL,
    signing_secret VARCHAR(255) NOT NULL,
    status ENUM('active','paused','disabled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NOT NULL,
    webhook_endpoint_id BIGINT NOT NULL,
    event_name VARCHAR(150) NOT NULL,
    payload JSON,
    response_code INT NULL,
    attempt_count INT DEFAULT 0,
    status ENUM('pending','success','failed','dead_letter') DEFAULT 'pending',
    next_retry_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (webhook_endpoint_id) REFERENCES webhook_endpoints(id)
);

CREATE INDEX idx_webhook_deliveries_status_retry ON webhook_deliveries (status, next_retry_at);

-- ---------------------------------------------------------------------
-- CMS expansion
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS cms_pages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    public_id CHAR(36) NOT NULL UNIQUE,
    tenant_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    status ENUM('draft','published','archived') DEFAULT 'draft',
    published_at DATETIME NULL,
    created_by BIGINT NULL,
    updated_by BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    UNIQUE KEY uq_cms_pages_tenant_slug (tenant_id, slug),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS cms_page_versions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NOT NULL,
    page_id BIGINT NOT NULL,
    version_no INT NOT NULL,
    content JSON NOT NULL,
    created_by BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_page_version (page_id, version_no),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (page_id) REFERENCES cms_pages(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS seo_meta (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id BIGINT NOT NULL,
    meta_title VARCHAR(255) NULL,
    meta_description TEXT NULL,
    canonical_url VARCHAR(512) NULL,
    robots VARCHAR(100) DEFAULT 'index,follow',
    og_data JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE INDEX idx_seo_entity ON seo_meta (entity_type, entity_id, tenant_id);

-- ---------------------------------------------------------------------
-- ERP expansion
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS student_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    public_id CHAR(36) NOT NULL UNIQUE,
    tenant_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    registration_no VARCHAR(100) NOT NULL,
    admission_year INT NOT NULL,
    course_id BIGINT NOT NULL,
    status ENUM('active','graduated','dropped','suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_student_profile_tenant_regno (tenant_id, registration_no),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

CREATE TABLE IF NOT EXISTS attendance_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NOT NULL,
    student_profile_id BIGINT NOT NULL,
    class_date DATE NOT NULL,
    subject_code VARCHAR(100) NOT NULL,
    status ENUM('present','absent','late','excused') NOT NULL,
    marked_by BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_attendance_unique (tenant_id, student_profile_id, class_date, subject_code),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id)
);

CREATE TABLE IF NOT EXISTS exam_results (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NOT NULL,
    student_profile_id BIGINT NOT NULL,
    exam_name VARCHAR(255) NOT NULL,
    semester VARCHAR(50) NULL,
    marks_obtained DECIMAL(8,2) NOT NULL,
    max_marks DECIMAL(8,2) NOT NULL,
    grade VARCHAR(20) NULL,
    published_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id)
);

CREATE TABLE IF NOT EXISTS fee_invoices (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    public_id CHAR(36) NOT NULL UNIQUE,
    tenant_id BIGINT NOT NULL,
    student_profile_id BIGINT NOT NULL,
    invoice_no VARCHAR(120) NOT NULL,
    amount_total DECIMAL(12,2) NOT NULL,
    amount_paid DECIMAL(12,2) DEFAULT 0.00,
    due_date DATE NOT NULL,
    status ENUM('draft','issued','partially_paid','paid','overdue','cancelled') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_invoice_tenant_no (tenant_id, invoice_no),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id)
);

CREATE TABLE IF NOT EXISTS fee_payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NOT NULL,
    invoice_id BIGINT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_mode ENUM('cash','card','bank_transfer','upi','gateway') NOT NULL,
    reference_no VARCHAR(120) NULL,
    paid_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (invoice_id) REFERENCES fee_invoices(id)
);

-- ---------------------------------------------------------------------
-- Event-driven consistency
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS outbox_events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NULL,
    aggregate_type VARCHAR(120) NOT NULL,
    aggregate_id VARCHAR(120) NOT NULL,
    event_name VARCHAR(150) NOT NULL,
    payload JSON NOT NULL,
    status ENUM('pending','published','failed') DEFAULT 'pending',
    retry_count INT DEFAULT 0,
    available_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_outbox_status_available ON outbox_events (status, available_at);
