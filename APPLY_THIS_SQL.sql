-- ============================================================
-- SkillSync — COMPLETE SCHEMATIC RESET (v2.3)
-- UNIFIED SCHEMA: Core + Institutional Identity + Auto-Linking
-- ============================================================

-- 1. DESTRUCTIVE CLEANUP
DROP TABLE IF EXISTS application CASCADE;
DROP TABLE IF EXISTS internship_skill CASCADE;
DROP TABLE IF EXISTS student_skill CASCADE;
DROP TABLE IF EXISTS internship CASCADE;
DROP TABLE IF EXISTS skill CASCADE;
DROP TABLE IF EXISTS company CASCADE;
DROP TABLE IF EXISTS admin CASCADE;
DROP TABLE IF EXISTS student CASCADE;
DROP TABLE IF EXISTS event CASCADE;
DROP TABLE IF EXISTS course CASCADE;
DROP TABLE IF EXISTS notification CASCADE;
DROP TABLE IF EXISTS college_directory CASCADE;
DROP TABLE IF EXISTS otp_logs CASCADE;
DROP TABLE IF EXISTS professor CASCADE;

-- 2. CORE TABLE DEFINITIONS
CREATE TABLE student (
    student_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    college VARCHAR(255),
    branch VARCHAR(255),
    graduation_year INT,
    resume_url TEXT,
    is_active BOOLEAN DEFAULT true,
    market_reach INTEGER DEFAULT 0,
    ai_resume_analysis JSONB
);

CREATE TABLE company (
    company_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    industry VARCHAR(255),
    location VARCHAR(255),
    is_verified BOOLEAN DEFAULT false
);

CREATE TABLE admin (
    admin_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'admin'
);

CREATE TABLE skill (
    skill_id SERIAL PRIMARY KEY,
    skill_name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(255)
);

CREATE TABLE internship (
    internship_id SERIAL PRIMARY KEY,
    company_id UUID REFERENCES company(company_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration VARCHAR(50),
    stipend VARCHAR(100),
    location VARCHAR(255),
    internship_type VARCHAR(50) DEFAULT 'Remote',
    start_date DATE,
    openings INTEGER DEFAULT 1,
    perks TEXT,
    deadline DATE
);

CREATE TABLE student_skill (
    student_id UUID REFERENCES student(student_id) ON DELETE CASCADE,
    skill_id INT REFERENCES skill(skill_id) ON DELETE CASCADE,
    proficiency_level VARCHAR(50) CHECK (proficiency_level IN ('Beginner','Intermediate','Advanced','Expert')),
    PRIMARY KEY (student_id, skill_id)
);

CREATE TABLE internship_skill (
    internship_id INT REFERENCES internship(internship_id) ON DELETE CASCADE,
    skill_id INT REFERENCES skill(skill_id) ON DELETE CASCADE,
    PRIMARY KEY (internship_id, skill_id)
);

CREATE TABLE application (
    application_id SERIAL PRIMARY KEY,
    student_id UUID REFERENCES student(student_id) ON DELETE CASCADE,
    internship_id INT REFERENCES internship(internship_id) ON DELETE CASCADE,
    applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Pending'
        CHECK (status IN ('Pending','Under Review','Interviewing','Accepted','Rejected')),
    ai_match_score INTEGER,
    ai_interview_questions JSONB,
    UNIQUE (student_id, internship_id)
);

CREATE TABLE event (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    event_type VARCHAR(100),
    start_time TIMESTAMP NOT NULL,
    description TEXT,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE course (
    course_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    color VARCHAR(100),
    icon VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notification (
    notification_id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'system',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE college_directory (
    id SERIAL PRIMARY KEY,
    roll_no VARCHAR(50) UNIQUE,
    enrollment_no VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'professor', 'admin')),
    email VARCHAR(255),
    course VARCHAR(255),
    branch VARCHAR(255),
    batch_year INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE otp_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    roll_no VARCHAR(50),
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. PROFILES VIEW
CREATE OR REPLACE VIEW profiles AS
  SELECT student_id as id, email, 'student' as role FROM student
  UNION ALL
  SELECT company_id as id, email, 'company' as role FROM company
  UNION ALL
  SELECT admin_id as id, email, 'admin' as role FROM admin;

-- 4. STATIC & DYNAMIC SEEDING
INSERT INTO skill (skill_name, category) VALUES
  ('Python','Programming'),('React','Frontend'),('SQL','Database'),
  ('Machine Learning','AI/ML'),('Node.js','Backend'),('Java','Programming'),
  ('TypeScript','Frontend'),('Docker','DevOps'),('Figma','Design') ON CONFLICT DO NOTHING;

INSERT INTO course (title, description, category, color, icon) VALUES 
  ('Figma Pro', 'Advanced design systems.', 'Design', 'bg-purple-50', 'Figma'),
  ('Neural Networks', 'Implementing deep learning.', 'AI', 'bg-amber-50', 'Brain') ON CONFLICT DO NOTHING;

INSERT INTO college_directory (roll_no, enrollment_no, name, course, branch, batch_year)
VALUES ('24/70001', 'EN24101', 'SkillSync User', 'B.Tech', 'Computer Science', 2025) ON CONFLICT DO NOTHING;

-- AUTO-LINK EXISTING AUTH USERS
INSERT INTO student (student_id, email, name, college, branch, graduation_year, market_reach)
SELECT id, email, 'SkillSync User', 'SkillSync Institute', 'Computer Science', 2025, 85
FROM auth.users WHERE email = 'demo@student.com'
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO admin (admin_id, email, role)
SELECT id, email, 'admin'
FROM auth.users WHERE email = 'admin@skillsync.com'
ON CONFLICT (admin_id) DO NOTHING;

INSERT INTO company (company_id, company_name, email, industry, location, is_verified)
SELECT id, 'InnovateTech', email, 'AI Research', 'Metaverse', true
FROM auth.users WHERE email = 'tech@innovate.com'
ON CONFLICT (company_id) DO NOTHING;

-- SEED DEPENDENT DATA (INTERNSHIPS, ETC)
DO $$
DECLARE
    cid UUID;
    sid UUID;
    iid INT;
BEGIN
    SELECT id INTO cid FROM auth.users WHERE email = 'tech@innovate.com';
    SELECT id INTO sid FROM auth.users WHERE email = 'demo@student.com';
    
    IF cid IS NOT NULL THEN
        INSERT INTO internship (company_id, title, description, duration, stipend, location, internship_type, openings)
        VALUES (cid, 'Neural Sync Intern', 'Deep dive into SkillSync architecture.', '6 Months', '₹50,000', 'Remote', 'Remote', 5)
        RETURNING internship_id INTO iid;
        
        IF sid IS NOT NULL AND iid IS NOT NULL THEN
            INSERT INTO application (student_id, internship_id, status, ai_match_score)
            VALUES (sid, iid, 'Under Review', 94)
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;
END $$;

-- 5. PERMISSIONS
GRANT ALL ON TABLE admin, student, company, skill, student_skill, internship, application, event, course, notification, college_directory, otp_logs TO anon, authenticated, service_role;
GRANT SELECT ON TABLE profiles TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

ALTER TABLE student ENABLE ROW LEVEL SECURITY;
ALTER TABLE application ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_access" ON student FOR SELECT USING (true);
CREATE POLICY "demo_write_access" ON student FOR ALL USING (true);
CREATE POLICY "public_read_access" ON application FOR SELECT USING (true);
CREATE POLICY "demo_write_access" ON application FOR ALL USING (true);

NOTIFY pgrst, 'reload schema';
