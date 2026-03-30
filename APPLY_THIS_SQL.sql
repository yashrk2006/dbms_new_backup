-- ============================================================
-- SkillSync — Full Schema + RLS + Seed Data
-- 
-- HOW TO APPLY:
-- 1. Go to: https://supabase.com/dashboard/project/cwtyqajzdlfzybnzjpma/sql/new
-- 2. Paste this entire file
-- 3. Click "Run"
-- ============================================================

-- Clean up any old tables that might have incompatible column types (like INT instead of UUID)
DROP TABLE IF EXISTS application CASCADE;
DROP TABLE IF EXISTS internship_requirements CASCADE;
DROP TABLE IF EXISTS student_skill CASCADE;
DROP TABLE IF EXISTS internship CASCADE;
DROP TABLE IF EXISTS skill CASCADE;
DROP TABLE IF EXISTS company CASCADE;
DROP TABLE IF EXISTS admin CASCADE;
DROP TABLE IF EXISTS student CASCADE;

-- Clean up leftover Supabase starter template artifacts causing integer/uuid conflicts
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

-- Tables
CREATE TABLE IF NOT EXISTS student (
    student_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    college VARCHAR(255),
    branch VARCHAR(255),
    graduation_year INT,
    resume_url TEXT
);

CREATE TABLE IF NOT EXISTS company (
    company_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    industry VARCHAR(255),
    location VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS admin (
    admin_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'admin'
);

CREATE TABLE IF NOT EXISTS skill (
    skill_id SERIAL PRIMARY KEY,
    skill_name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS internship (
    internship_id SERIAL PRIMARY KEY,
    company_id UUID REFERENCES company(company_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration VARCHAR(50),
    stipend VARCHAR(100),
    location VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS student_skill (
    student_id UUID REFERENCES student(student_id) ON DELETE CASCADE,
    skill_id INT REFERENCES skill(skill_id) ON DELETE CASCADE,
    proficiency_level VARCHAR(50) CHECK (proficiency_level IN ('Beginner','Intermediate','Advanced','Expert')),
    PRIMARY KEY (student_id, skill_id)
);

CREATE TABLE IF NOT EXISTS internship_requirements (
    internship_id INT REFERENCES internship(internship_id) ON DELETE CASCADE,
    skill_id INT REFERENCES skill(skill_id) ON DELETE CASCADE,
    PRIMARY KEY (internship_id, skill_id)
);

CREATE TABLE IF NOT EXISTS application (
    application_id SERIAL PRIMARY KEY,
    student_id UUID REFERENCES student(student_id) ON DELETE CASCADE,
    internship_id INT REFERENCES internship(internship_id) ON DELETE CASCADE,
    applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Pending'
        CHECK (status IN ('Pending','Under Review','Interviewing','Accepted','Rejected')),
    UNIQUE (student_id, internship_id)
);

-- Seed 15 skills
INSERT INTO skill (skill_name, category) VALUES
  ('Python','Programming'),('React','Frontend'),('SQL','Database'),
  ('Machine Learning','AI/ML'),('Node.js','Backend'),('Java','Programming'),
  ('TypeScript','Frontend'),('Docker','DevOps'),('Figma','Design'),
  ('Excel','Analytics'),('C++','Programming'),('Django','Backend'),
  ('Flutter','Mobile'),('AWS','Cloud'),('MongoDB','Database')
ON CONFLICT DO NOTHING;

-- Demo student user (for demo mode — no login required)
INSERT INTO auth.users (
  id, instance_id, aud, role, email,
  encrypted_password, email_confirmed_at, created_at, updated_at,
  raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'demo@student.com',
  '$2a$10$PgjZCUMBxFHPsG7bGGGpxOqHBHFHFHFHFHFHFHFHFHFHFHFHFHFH',
  now(), now(), now(),
  '{"role":"student","first_name":"Demo","last_name":"Student"}'::jsonb
) ON CONFLICT DO NOTHING;

INSERT INTO student (student_id, name, email, college, branch, graduation_year)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Demo Student', 'demo@student.com',
  'Demo Tech University', 'Computer Science', 2025
) ON CONFLICT DO NOTHING;

-- Demo Companies
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data) VALUES 
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tech@innovate.com', '$2a$10$PgjZCUMBxFHPsG7bGGGpxOqHBHFHFHFHFHFHFHFHFHFHFHFHFHFH', now(), now(), now(), '{"role":"company","company_name":"InnovateTech"}'),
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hr@globalfinance.com', '$2a$10$PgjZCUMBxFHPsG7bGGGpxOqHBHFHFHFHFHFHFHFHFHFHFHFHFHFH', now(), now(), now(), '{"role":"company","company_name":"Global Finance"}')
ON CONFLICT DO NOTHING;

INSERT INTO company (company_id, company_name, email, industry, location) VALUES 
('11111111-1111-1111-1111-111111111111', 'InnovateTech', 'tech@innovate.com', 'Technology', 'Bengaluru, India'),
('22222222-2222-2222-2222-222222222222', 'Global Finance', 'hr@globalfinance.com', 'Finance', 'Mumbai, India')
ON CONFLICT DO NOTHING;

-- Demo Internships
INSERT INTO internship (internship_id, company_id, title, description, duration, stipend, location) VALUES 
(1, '11111111-1111-1111-1111-111111111111', 'Frontend Developer Intern', 'Join our team to build amazing user interfaces using React and Next.js.', '6 Months', '₹30,000/month', 'Remote'),
(2, '11111111-1111-1111-1111-111111111111', 'Backend System Engineer', 'Work on high-performance scalable APIs with Node.js and PostgreSQL.', '3 Months', '₹45,000/month', 'Bengaluru, India'),
(3, '22222222-2222-2222-2222-222222222222', 'Data Analyst Intern', 'Analyze financial datasets to extract actionable insights for trading strategies.', '3 Months', '₹25,000/month', 'Mumbai, India')
ON CONFLICT DO NOTHING;

-- Demo Applications for the student
INSERT INTO application (student_id, internship_id, status) VALUES 
('00000000-0000-0000-0000-000000000000', 1, 'Under Review'),
('00000000-0000-0000-0000-000000000000', 3, 'Pending')
ON CONFLICT DO NOTHING;

-- Demo Student Skills
INSERT INTO student_skill (student_id, skill_id, proficiency_level) VALUES 
('00000000-0000-0000-0000-000000000000', 2, 'Intermediate'),
('00000000-0000-0000-0000-000000000000', 5, 'Beginner')
ON CONFLICT DO NOTHING;

-- RLS
ALTER TABLE student ENABLE ROW LEVEL SECURITY;
ALTER TABLE company ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_skill ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE application ENABLE ROW LEVEL SECURITY;

-- Public read for demo mode (anon can read skills, internships, companies)
CREATE POLICY "skill_read"             ON skill                  FOR SELECT USING (true);
CREATE POLICY "internship_read"        ON internship             FOR SELECT USING (true);
CREATE POLICY "internship_req_read"    ON internship_requirements FOR SELECT USING (true);
CREATE POLICY "company_read"           ON company                FOR SELECT USING (true);

-- Student: own row only
CREATE POLICY "student_select_own"     ON student       FOR SELECT USING (auth.uid() = student_id OR student_id = '00000000-0000-0000-0000-000000000000');
CREATE POLICY "student_insert_own"     ON student       FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "student_update_own"     ON student       FOR UPDATE USING (auth.uid() = student_id OR student_id = '00000000-0000-0000-0000-000000000000');

-- Student skills: own row + demo user
CREATE POLICY "student_skill_own"      ON student_skill FOR ALL   USING (auth.uid() = student_id OR student_id = '00000000-0000-0000-0000-000000000000');

-- Applications: own row + demo user
CREATE POLICY "application_own"        ON application   FOR ALL   USING (auth.uid() = student_id OR student_id = '00000000-0000-0000-0000-000000000000');

-- Admin read-all (Open for Demo Hackathon Mode)
CREATE POLICY "student_admin_read"     ON student       FOR SELECT USING (true);
CREATE POLICY "student_skill_admin"    ON student_skill FOR SELECT USING (true);
CREATE POLICY "application_admin"      ON application   FOR SELECT USING (true);

-- ============================================================
-- Fix Permissions & Schema Cache
-- ============================================================
GRANT ALL ON TABLE admin TO anon, authenticated, service_role;
GRANT ALL ON TABLE student TO anon, authenticated, service_role;
GRANT ALL ON TABLE company TO anon, authenticated, service_role;
GRANT ALL ON TABLE skill TO anon, authenticated, service_role;
GRANT ALL ON TABLE student_skill TO anon, authenticated, service_role;
GRANT ALL ON TABLE internship TO anon, authenticated, service_role;
GRANT ALL ON TABLE application TO anon, authenticated, service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
