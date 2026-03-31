-- ============================================================
-- SkillSync Institutional Identity Extension
-- ============================================================

-- 1. Master College Directory (Pre-Authorized Students/Faculty)
CREATE TABLE IF NOT EXISTS college_directory (
    id SERIAL PRIMARY KEY,
    roll_no VARCHAR(50) UNIQUE,
    enrollment_no VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'professor', 'admin')),
    email VARCHAR(255), -- Optional: If pre-stored
    course VARCHAR(255),
    branch VARCHAR(255),
    batch_year INT,
    gender VARCHAR(20),
    age INT,
    birth_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. OTP Verification Logs (Secure 6-digit Codes)
CREATE TABLE IF NOT EXISTS otp_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    roll_no VARCHAR(50),
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Professor Profile Table
CREATE TABLE IF NOT EXISTS professor (
    professor_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(255),
    designation VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Audit & Analytics Indexing
CREATE INDEX IF NOT EXISTS idx_college_directory_roll ON college_directory(roll_no);
CREATE INDEX IF NOT EXISTS idx_college_directory_enrollment ON college_directory(enrollment_no);
CREATE INDEX IF NOT EXISTS idx_otp_logs_email ON otp_logs(email);

-- 5. RLS (Row Level Security) - Admin only for the directory
ALTER TABLE college_directory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_full_access" ON college_directory FOR ALL USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'role' = 'admin');

-- 6. Permissions
GRANT ALL ON TABLE college_directory TO service_role;
GRANT ALL ON TABLE otp_logs TO service_role;
GRANT ALL ON TABLE professor TO service_role;
