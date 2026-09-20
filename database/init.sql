-- ====================================================================
-- Containerizing a College Portal - Database Initialization Script
-- Target RDBMS: PostgreSQL 16
-- Project: Academic / IBM Submission Standard
-- ====================================================================

-- 1. Create Extensions (if supported)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if re-initializing
DROP TABLE IF EXISTS container_events CASCADE;
DROP TABLE IF EXISTS faculty_workload CASCADE;
DROP TABLE IF EXISTS placement_profiles CASCADE;
DROP TABLE IF EXISTS certificate_requests CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS fee_records CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS student_risk_scores CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS parent_student_mapping CASCADE;
DROP TABLE IF EXISTS parents CASCADE;
DROP TABLE IF EXISTS system_metrics CASCADE;
DROP TABLE IF EXISTS event_registrations CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS timetable CASCADE;
DROP TABLE IF EXISTS marks CASCADE;
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS faculty CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 3. Users Table (Role-based access: student, faculty, admin, parent)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'faculty', 'admin', 'parent')),
    full_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(255) DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Students Table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    roll_number VARCHAR(30) UNIQUE NOT NULL,
    department VARCHAR(80) NOT NULL,
    semester INT NOT NULL DEFAULT 6,
    batch_year VARCHAR(20) NOT NULL DEFAULT '2022-2026',
    overall_attendance NUMERIC(5, 2) DEFAULT 87.50,
    cgpa NUMERIC(4, 2) DEFAULT 8.92,
    mentor_name VARCHAR(100) DEFAULT 'Dr. Robert Vance'
);

-- 5. Faculty Table
CREATE TABLE faculty (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(30) UNIQUE NOT NULL,
    department VARCHAR(80) NOT NULL,
    designation VARCHAR(80) NOT NULL,
    specialization VARCHAR(120) NOT NULL,
    cabin_location VARCHAR(50) DEFAULT 'Block C, Room 304'
);

-- 6. Courses Table
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    course_name VARCHAR(120) NOT NULL,
    department VARCHAR(80) NOT NULL,
    credits INT NOT NULL DEFAULT 4,
    instructor_id INT REFERENCES faculty(id) ON DELETE SET NULL,
    semester INT NOT NULL DEFAULT 6,
    description TEXT,
    thumbnail VARCHAR(255)
);

-- 7. Attendance Records
CREATE TABLE attendance_records (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    total_classes INT DEFAULT 45,
    attended_classes INT DEFAULT 39,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Marks Table
CREATE TABLE marks (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    internal_marks NUMERIC(5, 2) DEFAULT 28.5,
    midterm_marks NUMERIC(5, 2) DEFAULT 45.0,
    assignment_marks NUMERIC(5, 2) DEFAULT 18.0,
    grade VARCHAR(5) DEFAULT 'A+'
);

-- 9. Timetable Table
CREATE TABLE timetable (
    id SERIAL PRIMARY KEY,
    department VARCHAR(80) NOT NULL,
    semester INT NOT NULL,
    day_of_week VARCHAR(15) NOT NULL, -- Monday, Tuesday, etc.
    time_slot VARCHAR(30) NOT NULL,   -- '09:00 AM - 10:00 AM'
    course_code VARCHAR(20) NOT NULL,
    course_name VARCHAR(100) NOT NULL,
    room_number VARCHAR(30) NOT NULL,
    faculty_name VARCHAR(80) NOT NULL
);

-- 10. Assignments Table
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    max_score INT DEFAULT 100,
    status VARCHAR(30) DEFAULT 'Pending' -- 'Submitted', 'Pending', 'Graded'
);

-- 11. Events Table
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'Technical', 'Hackathon', 'Cultural', 'Guest Lecture'
    date_string VARCHAR(50) NOT NULL,
    venue VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    registration_count INT DEFAULT 0
);

-- 12. Event Registrations Table
CREATE TABLE event_registrations (
    id SERIAL PRIMARY KEY,
    event_id INT REFERENCES events(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Announcements Table
CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(40) NOT NULL, -- 'Exams', 'Placement', 'Holidays', 'Academic'
    content TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'Normal', -- 'Urgent', 'Important', 'Normal'
    date_posted VARCHAR(30) NOT NULL,
    author VARCHAR(80) DEFAULT 'Administration'
);

-- 14. System Metrics / Container Health Telemetry
CREATE TABLE system_metrics (
    id SERIAL PRIMARY KEY,
    tier VARCHAR(30) NOT NULL, -- 'frontend', 'backend', 'database'
    status VARCHAR(20) NOT NULL, -- 'Running', 'Healthy', 'Connected'
    uptime_seconds BIGINT DEFAULT 86400,
    memory_usage_mb NUMERIC(6, 2) DEFAULT 48.5,
    cpu_percent NUMERIC(4, 2) DEFAULT 1.8,
    active_connections INT DEFAULT 12,
    last_ping TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Parents Table
CREATE TABLE parents (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) DEFAULT '+1 (555) 234-8901',
    relationship VARCHAR(30) DEFAULT 'Father',
    occupation VARCHAR(80) DEFAULT 'Software Architect',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Parent-Student Mapping Table
CREATE TABLE parent_student_mapping (
    id SERIAL PRIMARY KEY,
    parent_id INT REFERENCES parents(id) ON DELETE CASCADE,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    relationship VARCHAR(30) DEFAULT 'Parent',
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. Smart Notifications Table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    target_role VARCHAR(20) NOT NULL, -- 'student', 'parent', 'faculty', 'admin', 'all'
    category VARCHAR(40) NOT NULL,    -- 'Attendance', 'Marks', 'Academic', 'Fees', 'Leave', 'Placement', 'System'
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'Normal', -- 'Low', 'Normal', 'Important', 'Urgent'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. AI Student Academic Risk Prediction
CREATE TABLE student_risk_scores (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    risk_score NUMERIC(5, 2) NOT NULL,    -- 0 to 100%
    risk_level VARCHAR(20) NOT NULL,       -- 'LOW', 'MEDIUM', 'HIGH'
    reasons TEXT[] NOT NULL,
    recommendations TEXT[] NOT NULL,
    last_computed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. Digital Leave Management
CREATE TABLE leave_requests (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    leave_type VARCHAR(40) NOT NULL,      -- 'Medical', 'Personal', 'Academic Event', 'Emergency'
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
    reviewed_by INT REFERENCES faculty(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 20. Fee Status & Payment Records
CREATE TABLE fee_records (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    semester INT NOT NULL,
    academic_year VARCHAR(20) DEFAULT '2025-2026',
    total_fee NUMERIC(10, 2) DEFAULT 85000.00,
    paid_amount NUMERIC(10, 2) DEFAULT 60000.00,
    pending_amount NUMERIC(10, 2) DEFAULT 25000.00,
    due_date DATE DEFAULT '2026-09-30',
    status VARCHAR(30) DEFAULT 'Payment Pending', -- 'Paid', 'Payment Pending', 'Overdue'
    payment_reference VARCHAR(50),
    last_payment_date DATE
);

-- 21. Helpdesk Complaints & Tickets
CREATE TABLE complaints (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    category VARCHAR(40) NOT NULL,        -- 'Academic', 'Infrastructure', 'Hostel', 'Transport', 'IT', 'Library'
    priority VARCHAR(20) DEFAULT 'Normal',-- 'Low', 'Normal', 'High', 'Urgent'
    subject VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'Open',    -- 'Open', 'In Progress', 'Resolved', 'Closed'
    assigned_to VARCHAR(80) DEFAULT 'Campus Facilities Cell',
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 22. Document / Certificate Requests
CREATE TABLE certificate_requests (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    certificate_type VARCHAR(60) NOT NULL,-- 'Bonafide Certificate', 'Study Certificate', 'Course Completion', 'Transfer Certificate', 'Fee Certificate'
    purpose TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'Processing', -- 'Requested', 'Processing', 'Approved', 'Ready for Download', 'Rejected'
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    issued_at TIMESTAMP WITH TIME ZONE,
    remarks VARCHAR(150)
);

-- 23. Placement Readiness Scores
CREATE TABLE placement_profiles (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    technical_skills NUMERIC(5, 2) DEFAULT 82.0,
    coding_score NUMERIC(5, 2) DEFAULT 80.0,
    aptitude_score NUMERIC(5, 2) DEFAULT 75.0,
    communication_score NUMERIC(5, 2) DEFAULT 72.0,
    projects_count INT DEFAULT 4,
    certifications_count INT DEFAULT 3,
    readiness_score NUMERIC(5, 2) DEFAULT 82.0,
    readiness_status VARCHAR(30) DEFAULT 'Placement Ready', -- 'Placement Ready', 'Needs Preparation', 'At Risk'
    recommendations TEXT[] DEFAULT ARRAY['Strengthen Mock Technical Interviews', 'Refine GitHub Project Readmes'],
    resume_status VARCHAR(30) DEFAULT 'Verified'
);

-- 24. Faculty Workload
CREATE TABLE faculty_workload (
    id SERIAL PRIMARY KEY,
    faculty_id INT REFERENCES faculty(id) ON DELETE CASCADE,
    courses_assigned INT DEFAULT 4,
    total_students INT DEFAULT 182,
    classes_per_week INT DEFAULT 18,
    pending_assignments INT DEFAULT 7,
    pending_marks INT DEFAULT 3,
    pending_leaves INT DEFAULT 4,
    workload_percentage NUMERIC(5, 2) DEFAULT 78.0
);

-- 25. Container Events & Auto-Healing Audit Log
CREATE TABLE container_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(40) NOT NULL, -- 'FAILURE_DETECTED', 'AUTO_HEALING_INITIATED', 'HEALTH_PROBE_PASSED', 'SERVICE_RESTORED'
    service VARCHAR(40) NOT NULL,    -- 'frontend', 'backend', 'database'
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'Info', -- 'Info', 'Warning', 'Error', 'Recovery'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- SEED DATA INSERTION
-- ====================================================================

-- Demo Users
INSERT INTO users (id, username, email, password_hash, role, full_name, avatar_url) VALUES
(1, 'student', 'alex.chen@apex.edu', '$2a$10$wE8L1iVwLd5VdO6n9y9ZCe7J8V4P0yV6tGZkQY4vBfH4z.demo123', 'student', 'Alex Chen', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'),
(2, 'faculty', 'robert.vance@apex.edu', '$2a$10$wE8L1iVwLd5VdO6n9y9ZCe7J8V4P0yV6tGZkQY4vBfH4z.demo123', 'faculty', 'Dr. Robert Vance', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'),
(3, 'admin', 'admin@apex.edu', '$2a$10$wE8L1iVwLd5VdO6n9y9ZCe7J8V4P0yV6tGZkQY4vBfH4z.demo123', 'admin', 'Dr. Elena Rostova', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80'),
(4, 'parent', 'robert.chen.parent@gmail.com', '$2a$10$wE8L1iVwLd5VdO6n9y9ZCe7J8V4P0yV6tGZkQY4vBfH4z.demo123', 'parent', 'Robert Chen Sr.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80'),
(5, 'sophia', 'sophia.m@apex.edu', '$2a$10$wE8L1iVwLd5VdO6n9y9ZCe7J8V4P0yV6tGZkQY4vBfH4z.demo123', 'student', 'Sophia Martinez', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80'),
(6, 'david', 'david.k@apex.edu', '$2a$10$wE8L1iVwLd5VdO6n9y9ZCe7J8V4P0yV6tGZkQY4vBfH4z.demo123', 'student', 'David Kim', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80'),
(7, 'marcus', 'marcus.v@apex.edu', '$2a$10$wE8L1iVwLd5VdO6n9y9ZCe7J8V4P0yV6tGZkQY4vBfH4z.demo123', 'student', 'Marcus Vance', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80'),
(8, 'daniel', 'daniel.c@apex.edu', '$2a$10$wE8L1iVwLd5VdO6n9y9ZCe7J8V4P0yV6tGZkQY4vBfH4z.demo123', 'student', 'Daniel Craig', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80');

-- Students Seed (10 Students covering high performer, low attendance, low marks, etc.)
INSERT INTO students (id, user_id, roll_number, department, semester, batch_year, overall_attendance, cgpa, mentor_name) VALUES
(1, 1, 'APX-2022-CS-084', 'Computer Science & Cloud Computing', 6, '2022-2026', 88.40, 8.92, 'Dr. Robert Vance'),
(2, 5, 'APX-2022-CS-091', 'Computer Science & Cloud Computing', 6, '2022-2026', 94.00, 9.35, 'Dr. Robert Vance'),
(3, 6, 'APX-2022-CS-104', 'Artificial Intelligence & Data Science', 6, '2022-2026', 82.50, 8.41, 'Prof. Anita Sharma'),
(4, NULL, 'APX-2023-CS-022', 'Computer Science & Cloud Computing', 4, '2023-2027', 91.20, 8.78, 'Dr. Kenneth Cole'),
(5, NULL, 'APX-2022-ECE-044', 'Electronics & Communication', 6, '2022-2026', 76.00, 7.65, 'Dr. Sarah Connor'),
(6, 7, 'APX-2022-CS-112', 'Computer Science & Cloud Computing', 6, '2022-2026', 64.50, 6.80, 'Dr. Robert Vance'),
(7, 8, 'APX-2022-CS-118', 'Computer Science & Cloud Computing', 6, '2022-2026', 78.00, 5.20, 'Prof. Anita Sharma'),
(8, NULL, 'APX-2022-CS-125', 'Computer Science & Cloud Computing', 6, '2022-2026', 85.00, 7.90, 'Dr. Kenneth Cole'),
(9, NULL, 'APX-2022-CS-130', 'Artificial Intelligence & Data Science', 6, '2022-2026', 89.00, 8.85, 'Dr. Rajesh Iyer'),
(10, NULL, 'APX-2022-CS-135', 'Computer Science & Cloud Computing', 6, '2022-2026', 86.50, 8.10, 'Dr. Robert Vance');

-- Parents Seed
INSERT INTO parents (id, user_id, full_name, email, phone, relationship, occupation) VALUES
(1, 4, 'Robert Chen Sr.', 'robert.chen.parent@gmail.com', '+1 (555) 234-8901', 'Father', 'Cloud Solutions Architect'),
(2, NULL, 'Carmen Martinez', 'carmen.m.parent@gmail.com', '+1 (555) 345-6789', 'Mother', 'Pediatrician'),
(3, NULL, 'Jin Kim', 'jin.kim.parent@gmail.com', '+1 (555) 456-7890', 'Father', 'Financial Analyst'),
(4, NULL, 'Sunita Patel', 'sunita.p.parent@gmail.com', '+1 (555) 567-8901', 'Mother', 'High School Principal'),
(5, NULL, 'Carlos Silva', 'carlos.s.parent@gmail.com', '+1 (555) 678-9012', 'Father', 'Civil Engineer'),
(6, NULL, 'George Vance', 'george.vance.parent@gmail.com', '+1 (555) 789-0123', 'Father', 'Business Executive'),
(7, NULL, 'Arthur Craig', 'arthur.c.parent@gmail.com', '+1 (555) 890-1234', 'Father', 'Operations Manager'),
(8, NULL, 'Wei Lin', 'wei.lin.parent@gmail.com', '+1 (555) 901-2345', 'Mother', 'Data Scientist'),
(9, NULL, 'Sunita Gupta', 'sunita.g.parent@gmail.com', '+1 (555) 012-3456', 'Mother', 'Professor'),
(10, NULL, 'Suresh Nair', 'suresh.n.parent@gmail.com', '+1 (555) 123-4567', 'Father', 'Senior Director');

-- Parent Student Mappings
INSERT INTO parent_student_mapping (parent_id, student_id, relationship) VALUES
(1, 1, 'Father'),
(2, 2, 'Mother'),
(3, 3, 'Father'),
(4, 4, 'Mother'),
(5, 5, 'Father'),
(6, 6, 'Father'),
(7, 7, 'Father'),
(8, 8, 'Mother'),
(9, 9, 'Mother'),
(10, 10, 'Father');

-- Faculty Seed (5 Faculty)
INSERT INTO faculty (id, user_id, employee_id, department, designation, specialization, cabin_location) VALUES
(1, 2, 'FAC-CS-109', 'Computer Science & Cloud Computing', 'Professor & Cloud Lead', 'Distributed Systems & Docker Containerization', 'IBM Center of Excellence, Room 402'),
(2, NULL, 'FAC-CS-114', 'Computer Science & Engineering', 'Associate Professor', 'Full Stack Frameworks & Reactive Systems', 'Block C, Room 310'),
(3, NULL, 'FAC-CS-098', 'Computer Science', 'Assistant Professor', 'Database Internals & Storage Sharding', 'Block B, Room 204'),
(4, NULL, 'FAC-AI-120', 'AI & Data Science', 'Associate Professor', 'Deep Learning & Neural Architectures', 'AI Suite, Room 105'),
(5, NULL, 'FAC-CS-133', 'Computer Science', 'Assistant Professor', 'DevOps & Site Reliability Engineering', 'Cloud Lab 2, Room 218');

-- Courses Seed (8 Courses)
INSERT INTO courses (id, course_code, course_name, department, credits, instructor_id, semester, description, thumbnail) VALUES
(1, 'CS601', 'Cloud Computing & Microservices', 'Computer Science', 4, 1, 6, 'Design, containerization, and orchestration of cloud applications using Docker, Kubernetes, and IBM Cloud.', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80'),
(2, 'CS602', 'Full-Stack Web Architectures', 'Computer Science', 4, 2, 6, 'Modern web frameworks, REST APIs, asynchronous messaging, and container deployment pipelines.', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80'),
(3, 'CS603', 'Database Internals & Distributed Storage', 'Computer Science', 3, 3, 6, 'ACID transactions, PostgreSQL indexing, distributed clustering, and volume persistence in Docker.', 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=400&q=80'),
(4, 'CS604', 'Container Security & DevSecOps', 'Computer Science', 3, 1, 6, 'Image scanning, rootless containers, RBAC policies, and CI/CD security gating.', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=400&q=80'),
(5, 'CS605', 'Artificial Intelligence & Neural Systems', 'AI & Data Science', 4, 4, 6, 'Deep learning models, computer vision, and deploying scalable inference containers.', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=400&q=80'),
(6, 'CS606', 'Distributed Algorithms', 'Computer Science', 3, 1, 6, 'Consensus algorithms, Raft, Paxos, and clock synchronization across container clusters.', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80'),
(7, 'CS607', 'DevOps & Site Reliability Engineering', 'Computer Science', 3, 5, 6, 'Automated CI/CD, Prometheus monitoring, Grafana dashboards, and auto-remediation.', 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?auto=format&fit=crop&w=400&q=80'),
(8, 'CS608', 'Cloud Native Security', 'Computer Science', 3, 1, 6, 'Runtime security, eBPF telemetry, network policies, and vulnerability management.', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=80');

-- Attendance Records (All 10 Enrolled Students)
INSERT INTO attendance_records (student_id, course_id, total_classes, attended_classes) VALUES
(1, 1, 42, 39), (1, 2, 40, 36), (1, 3, 38, 33), (1, 4, 36, 31), (1, 5, 40, 34),
(2, 1, 42, 41), (2, 2, 40, 38), (2, 3, 38, 36), (2, 4, 36, 34), (2, 5, 40, 38),
(3, 1, 42, 35), (3, 2, 40, 33), (3, 3, 38, 31), (3, 4, 36, 30), (3, 5, 40, 35),
(4, 1, 42, 38), (4, 2, 40, 37), (4, 3, 38, 34), (4, 4, 36, 33), (4, 5, 40, 37),
(5, 1, 42, 32), (5, 2, 40, 30), (5, 3, 38, 29), (5, 4, 36, 27), (5, 5, 40, 31),
(6, 1, 42, 27), (6, 2, 40, 25), (6, 3, 38, 25), (6, 4, 36, 23), (6, 5, 40, 26),
(7, 1, 42, 33), (7, 2, 40, 31), (7, 3, 38, 29), (7, 4, 36, 28), (7, 5, 40, 32),
(8, 1, 42, 36), (8, 2, 40, 34), (8, 3, 38, 32), (8, 4, 36, 31), (8, 5, 40, 34),
(9, 1, 42, 38), (9, 2, 40, 35), (9, 3, 38, 34), (9, 4, 36, 32), (9, 5, 40, 36),
(10, 1, 42, 36), (10, 2, 40, 35), (10, 3, 38, 33), (10, 4, 36, 31), (10, 5, 40, 34);

-- Marks Seed (All 10 Enrolled Students Across 5 Core Courses)
INSERT INTO marks (student_id, course_id, internal_marks, midterm_marks, assignment_marks, grade) VALUES
(1, 1, 29.0, 48.0, 19.5, 'A+'), (1, 2, 27.5, 44.0, 18.0, 'A'), (1, 3, 28.0, 46.5, 19.0, 'A+'), (1, 4, 26.0, 43.0, 17.5, 'A'), (1, 5, 28.5, 45.0, 18.5, 'A+'),
(2, 1, 30.0, 49.0, 20.0, 'A+'), (2, 2, 29.5, 48.5, 19.5, 'A+'), (2, 3, 28.5, 47.0, 19.0, 'A+'), (2, 4, 29.0, 48.0, 19.5, 'A+'), (2, 5, 29.5, 49.0, 20.0, 'A+'),
(3, 1, 25.0, 41.0, 17.0, 'A'), (3, 2, 26.0, 42.5, 17.5, 'A'), (3, 3, 24.5, 40.0, 16.5, 'A'), (3, 4, 25.5, 41.5, 17.0, 'A'), (3, 5, 27.0, 43.5, 18.0, 'A'),
(4, 1, 27.0, 44.0, 18.5, 'A'), (4, 2, 28.0, 45.5, 19.0, 'A+'), (4, 3, 26.5, 43.0, 18.0, 'A'), (4, 4, 27.5, 44.5, 18.5, 'A+'), (4, 5, 26.0, 42.0, 18.0, 'A'),
(5, 1, 23.0, 37.0, 15.5, 'B+'), (5, 2, 24.0, 38.0, 16.0, 'B+'), (5, 3, 22.5, 36.5, 15.0, 'B'), (5, 4, 23.5, 38.0, 16.0, 'B+'), (5, 5, 24.5, 39.0, 16.5, 'A'),
(6, 1, 18.0, 32.0, 14.0, 'C'), (6, 2, 19.5, 33.5, 14.5, 'C'), (6, 3, 20.0, 34.0, 15.0, 'C'), (6, 4, 19.0, 33.0, 15.0, 'C'), (6, 5, 21.0, 35.0, 15.5, 'B'),
(7, 1, 12.0, 22.0, 10.0, 'F'), (7, 2, 14.0, 25.0, 11.5, 'D'), (7, 3, 13.5, 26.0, 11.0, 'D'), (7, 4, 15.0, 28.0, 12.0, 'D'), (7, 5, 16.0, 29.5, 13.0, 'C'),
(8, 1, 24.0, 39.0, 16.5, 'B+'), (8, 2, 25.0, 40.5, 17.0, 'A'), (8, 3, 23.5, 38.0, 16.0, 'B+'), (8, 4, 24.5, 39.5, 17.0, 'A'), (8, 5, 25.0, 41.0, 17.5, 'A'),
(9, 1, 27.5, 44.5, 18.5, 'A+'), (9, 2, 26.5, 43.5, 18.0, 'A'), (9, 3, 27.0, 44.0, 18.5, 'A'), (9, 4, 26.0, 43.0, 18.0, 'A'), (9, 5, 28.0, 46.0, 19.0, 'A+'),
(10, 1, 25.0, 40.5, 17.0, 'A'), (10, 2, 25.5, 41.0, 17.5, 'A'), (10, 3, 24.0, 39.5, 16.5, 'A'), (10, 4, 24.5, 40.0, 17.0, 'A'), (10, 5, 26.0, 42.0, 17.5, 'A');

-- AI Student Risk Scores
INSERT INTO student_risk_scores (student_id, risk_score, risk_level, reasons, recommendations) VALUES
(1, 12.0, 'LOW', ARRAY['Consistent attendance above 85%', 'High internal assessment scores', 'All assignments submitted on time'], ARRAY['Eligible for Honors Research Fellowship', 'Consider applying for IBM Cloud Mentorship']),
(6, 84.0, 'HIGH', ARRAY['Overall attendance (64.5%) below mandatory 75% threshold', 'Course CS601 attendance at 61.9%', '2 pending lab submissions'], ARRAY['Schedule immediate academic counseling', 'Submit medical exemption certificate if applicable', 'Mandatory remedial tutorial on Fridays']),
(7, 72.0, 'HIGH', ARRAY['Internal marks in CS601 are 12/30 (below 50%)', 'Midterm marks 22/50', 'CGPA at 5.20'], ARRAY['Enroll in peer mentoring for Cloud Computing', 'Re-attempt practice assessments before end-semesters']),
(8, 48.0, 'MEDIUM', ARRAY['3 assignment submissions overdue', 'Attendance borderline at 85%'], ARRAY['Submit pending assignments before late penalty deadline', 'Consult course instructor for assignment rubrics']);

-- Digital Leave Requests
INSERT INTO leave_requests (student_id, leave_type, from_date, to_date, reason, status, reviewed_by, remarks) VALUES
(1, 'Academic Event', '2026-09-22', '2026-09-23', 'Representing Apex Institute at IBM Inter-University Cloud Hackathon.', 'Approved', 1, 'Granted with duty attendance exemption.'),
(6, 'Medical', '2026-09-12', '2026-09-15', 'Severe viral fever and hospitalized rest.', 'Pending', NULL, NULL);

-- Fee Records
INSERT INTO fee_records (student_id, semester, total_fee, paid_amount, pending_amount, due_date, status) VALUES
(1, 6, 85000.00, 60000.00, 25000.00, '2026-09-30', 'Payment Pending'),
(2, 6, 85000.00, 85000.00, 0.00, '2026-09-30', 'Paid'),
(6, 6, 85000.00, 40000.00, 45000.00, '2026-09-15', 'Overdue');

-- Complaints / Helpdesk Tickets
INSERT INTO complaints (student_id, category, priority, subject, description, status, assigned_to) VALUES
(1, 'Infrastructure', 'Normal', 'Docker Desktop licensing sync in Lab 4', 'Host terminal cannot authenticate with corporate Docker registry in Lab 4 Workstation 12.', 'In Progress', 'IT Infrastructure Team'),
(6, 'Academic', 'High', 'Discrepancy in Midterm Attendance Logs', 'Attended extra lecture on Sept 2nd but record marks absent.', 'Open', 'Academic Office');

-- Certificate Requests
INSERT INTO certificate_requests (student_id, certificate_type, purpose, status) VALUES
(1, 'Bonafide Certificate', 'Visa processing for International Student Cloud Conference in Zurich.', 'Approved'),
(1, 'Study Certificate', 'Education loan subsidy renewal.', 'Processing');

-- Placement Readiness
INSERT INTO placement_profiles (student_id, technical_skills, coding_score, aptitude_score, communication_score, projects_count, certifications_count, readiness_score, readiness_status) VALUES
(1, 88.0, 85.0, 82.0, 78.0, 4, 3, 84.5, 'Placement Ready'),
(9, 65.0, 58.0, 60.0, 70.0, 2, 1, 62.0, 'Needs Preparation');

-- Faculty Workload
INSERT INTO faculty_workload (faculty_id, courses_assigned, total_students, classes_per_week, pending_assignments, pending_marks, pending_leaves, workload_percentage) VALUES
(1, 4, 182, 18, 7, 3, 4, 78.0),
(2, 2, 110, 12, 3, 1, 1, 55.0),
(3, 2, 95, 10, 2, 2, 0, 48.0);

-- Initial Smart Notifications
INSERT INTO notifications (user_id, target_role, category, title, message, priority) VALUES
(1, 'student', 'Academic', 'Cloud Practicum Hall Assigned', 'Docker containers hands-on lab moved to IBM Suite Lab 4 for optimal hardware acceleration.', 'Normal'),
(4, 'parent', 'Fees', 'Semester 6 Tuition Fee Reminder', 'Tuition installment of INR 25,000 for Alex Chen is due by September 30, 2026.', 'Normal'),
(4, 'parent', 'Attendance', 'Attendance Update: Data Structures', 'Alex Chen attended 39 out of 42 classes. Attendance stands at 92.8%. Keep up the great momentum!', 'Normal'),
(7, 'student', 'Attendance', '⚠️ Low Attendance Warning', 'Marcus Vance, your current overall attendance is 64.5%. Minimum requirement for examination eligibility is 75%.', 'Urgent');

-- Container Audit Events
INSERT INTO container_events (event_type, service, message, severity) VALUES
('HEALTH_PROBE_PASSED', 'frontend', 'Nginx reverse proxy container passed health check (200 OK).', 'Info'),
('HEALTH_PROBE_PASSED', 'backend', 'Node.js Express microservice responding on port 5000 with sub-50ms latency.', 'Info'),
('HEALTH_PROBE_PASSED', 'database', 'PostgreSQL 16 relational cluster verified with healthy write replica.', 'Info');

-- System Metrics Initial Telemetry
INSERT INTO system_metrics (tier, status, uptime_seconds, memory_usage_mb, cpu_percent, active_connections) VALUES
('frontend', 'Running', 124500, 32.4, 0.8, 48),
('backend', 'Running', 124500, 64.2, 1.4, 18),
('database', 'Connected', 124500, 112.6, 2.1, 8);

