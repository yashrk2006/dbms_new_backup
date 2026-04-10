-- ============================================================
-- V16 Student Operationalization Migration
-- Expands the database to support Chat, Calendar, Notifications,
-- Learning (Courses), and Networking features.
-- 
-- HOW TO APPLY:
-- 1. Go to: https://supabase.com/dashboard/project/cwtyqajzdlfzybnzjpma/sql/new
-- 2. Paste this entire file
-- 3. Click "Run"
-- ============================================================

-- 1. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notification (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'system' CHECK (type IN ('system','application','interview','course','network')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. MESSAGES (CHAT / NETWORKING)
CREATE TABLE IF NOT EXISTS message (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. CALENDAR EVENTS (MOCK INTERVIEWS, DEADLINES)
CREATE TABLE IF NOT EXISTS event (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) DEFAULT 'interview' CHECK (event_type IN ('interview','webinar','deadline','networking')),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. LEARNING COURSES (RECOMMENDATIONS)
CREATE TABLE IF NOT EXISTS course (
    course_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    provider VARCHAR(100),
    level VARCHAR(50) CHECK (level IN ('Beginner','Intermediate','Advanced')),
    tags JSONB, -- Array of strings (e.g., ["#frontend", "#react"])
    icon VARCHAR(50), -- Material symbol name
    color VARCHAR(50), -- Tailwind color (e.g., 'blue-500')
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_course (
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id INT REFERENCES course(course_id) ON DELETE CASCADE,
    progress INT DEFAULT 0, -- 0 to 100
    status VARCHAR(50) DEFAULT 'Enrolled' CHECK (status IN ('Enrolled','Completed','Dropped')),
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, course_id)
);

-- UPDATE APPLICATION TABLE FOR RESUME
ALTER TABLE application 
ADD COLUMN IF NOT EXISTS simulation_data JSONB;

-- 5. RLS
ALTER TABLE notification ENABLE ROW LEVEL SECURITY;
ALTER TABLE message ENABLE ROW LEVEL SECURITY;
ALTER TABLE event ENABLE ROW LEVEL SECURITY;
ALTER TABLE course ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_course ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_own" ON notification FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "message_own" ON message FOR ALL USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "event_own" ON event FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "course_read" ON course FOR SELECT USING (true);
CREATE POLICY "student_course_own" ON student_course FOR ALL USING (auth.uid() = student_id);

-- SEED COURSES
INSERT INTO course (title, description, provider, level, tags, icon, color) VALUES 
('Figma Pro: UI/UX Masterclass', 'Real-world project-based learning for UI designers.', 'Alvance Academy', 'Intermediate', '["#design", "#ui", "#figma"]', 'category', 'purple-500'),
('Next.js Fullstack Architecture', 'Build modern web applications with React 18 and Next.js App Router.', 'Vercel', 'Advanced', '["#frontend", "#react", "#nextjs"]', 'grid_view', 'emerald-500'),
('Advanced Database Design', 'Master PostgreSQL schema design and indexing.', 'Alvance Academy', 'Advanced', '["#backend", "#sql", "#database"]', 'architecture', 'cyan-400')
ON CONFLICT DO NOTHING;

-- PERMISSIONS
GRANT ALL ON TABLE notification TO anon, authenticated, service_role;
GRANT ALL ON TABLE message TO anon, authenticated, service_role;
GRANT ALL ON TABLE event TO anon, authenticated, service_role;
GRANT ALL ON TABLE course TO anon, authenticated, service_role;
GRANT ALL ON TABLE student_course TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
