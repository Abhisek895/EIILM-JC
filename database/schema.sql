-- College Management Platform Database Schema
-- Clean, reproducible production schema for MySQL 8.0+

CREATE TABLE IF NOT EXISTS colleges (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS permissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    module VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    UNIQUE KEY uq_module_action (module, action)
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id BIGINT NOT NULL,
    status ENUM('active','inactive','blocked','pending') DEFAULT 'active',
    last_login DATETIME,
    otp_code VARCHAR(6) NULL,
    otp_expires_at DATETIME NULL,
    permissions JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS site_settings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NULL,
    key_name VARCHAR(150) NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_tenant_key (tenant_id, key_name)
);

CREATE TABLE IF NOT EXISTS courses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NULL,
    course_name VARCHAR(255) NOT NULL,
    course_code VARCHAR(100),
    course_type ENUM('UG','PG','Diploma','Certificate') NOT NULL,
    slug VARCHAR(255) UNIQUE,
    duration VARCHAR(100),
    eligibility TEXT,
    fees TEXT,
    description TEXT,
    banner VARCHAR(512) NULL,
    syllabus VARCHAR(512) NULL,
    specialization VARCHAR(255) NULL,
    show_fees BOOLEAN DEFAULT TRUE,
    status ENUM('draft','published','archived') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS specializations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    course_id BIGINT NOT NULL,
    specialization_name VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('active','inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS syllabi (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    course_id BIGINT NOT NULL,
    semester VARCHAR(100),
    pdf_url VARCHAR(512),
    version VARCHAR(50),
    regulation_year VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS departments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    code VARCHAR(50) UNIQUE NULL,
    description TEXT,
    hod_id BIGINT NULL,
    status ENUM('active','inactive') DEFAULT 'active',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (hod_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS faculty (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    department_id BIGINT NULL,
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(150),
    photo VARCHAR(512),
    qualification VARCHAR(255),
    experience VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(100),
    bio TEXT,
    status ENUM('active','inactive') DEFAULT 'active',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS notices (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(512) NULL,
    pdf_url VARCHAR(512) NULL,
    publish_date DATE NULL,
    expiry_date DATE NULL,
    priority ENUM('low','medium','high') DEFAULT 'medium',
    status ENUM('draft','published','expired') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    banner VARCHAR(512),
    start_date DATE,
    end_date DATE,
    location VARCHAR(255),
    registration_link VARCHAR(512),
    status ENUM('draft','published','completed') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS media_library (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_url VARCHAR(512) NOT NULL,
    uploaded_by BIGINT NULL,
    module VARCHAR(100),
    alt_text VARCHAR(255),
    tags VARCHAR(255),
    file_size INT NULL,
    width INT NULL,
    height INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS inquiries (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(100),
    email VARCHAR(255),
    course_id BIGINT NULL,
    specialization_id BIGINT NULL,
    city VARCHAR(255),
    message TEXT,
    source VARCHAR(100),
    status ENUM('new','contacted','interested','follow_up','converted','rejected','closed','enrolled') DEFAULT 'new',
    assigned_to BIGINT NULL,
    followup_date DATE,
    notes TEXT,
    first_name VARCHAR(100) NULL,
    last_name VARCHAR(100) NULL,
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
    source_name VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    FOREIGN KEY (specialization_id) REFERENCES specializations(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NULL,
    user_id BIGINT NULL,
    event_type VARCHAR(100) NOT NULL,
    module VARCHAR(100),
    reference_id VARCHAR(255),
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(100),
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS page_sections (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NULL,
    page_key VARCHAR(150) NOT NULL,
    section_key VARCHAR(150) NOT NULL,
    sort_order INT DEFAULT 0,
    config JSON,
    status ENUM('active','inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_page_section (tenant_id, page_key, section_key)
);

CREATE TABLE IF NOT EXISTS form_definitions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    config JSON,
    status ENUM('draft','published') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS form_submissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NULL,
    form_id BIGINT NOT NULL,
    data JSON,
    ip_address VARCHAR(100),
    source VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (form_id) REFERENCES form_definitions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS infrastructures (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(512),
    video_url VARCHAR(512),
    icon VARCHAR(50),
    category ENUM('facility', 'tour', 'campus_highlight', 'hero') DEFAULT 'facility',
    status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS placements (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NULL,
    student_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    company_logo VARCHAR(1000) DEFAULT NULL,
    package VARCHAR(100) NOT NULL,
    year VARCHAR(20) NOT NULL,
    course VARCHAR(255) DEFAULT NULL,
    student_image VARCHAR(1000) DEFAULT NULL,
    placement_type ENUM('placement','internship') DEFAULT 'placement',
    status ENUM('draft','published','archived') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS page_views (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    path VARCHAR(255) NOT NULL,
    user_agent VARCHAR(255) NULL,
    ip_address VARCHAR(100) NULL,
    country VARCHAR(50) NULL,
    region VARCHAR(100) NULL,
    city VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_knowledge_base (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category VARCHAR(255) NOT NULL DEFAULT 'General',
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    keywords TEXT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    source VARCHAR(255) NOT NULL DEFAULT 'manual',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FULLTEXT KEY ft_chat_knowledge (question, answer, keywords)
);

CREATE TABLE IF NOT EXISTS chat_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(255) NOT NULL UNIQUE,
    user_ip VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(255) NOT NULL,
    role ENUM('user', 'assistant', 'system') NOT NULL,
    message LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_chat_messages_session (session_id)
);

CREATE TABLE IF NOT EXISTS grades (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    semester VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    grade VARCHAR(10) NOT NULL,
    credits INT NOT NULL,
    status ENUM('Pass', 'Fail', 'Pending') DEFAULT 'Pass',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fee_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATETIME NOT NULL,
    status ENUM('Paid', 'Pending', 'Overdue') DEFAULT 'Pending',
    receipt_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);
