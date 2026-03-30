/**
 * Applies schema by creating an exec_sql RPC function first via the
 * Supabase Management API, then running the schema SQL through it.
 * Only needs SUPABASE_ACCESS_TOKEN (personal access token).
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const PROJECT_REF = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split('.')[0];
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error('❌ Add SUPABASE_ACCESS_TOKEN to .env.local');
  console.error('   Get it from: https://supabase.com/dashboard/account/tokens');
  process.exit(1);
}

async function runSQL(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ACCESS_TOKEN}` },
    body: JSON.stringify({ query: sql }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

const SCHEMA = `
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
INSERT INTO skill (skill_name, category) VALUES
  ('Python','Programming'),('React','Frontend'),('SQL','Database'),
  ('Machine Learning','AI/ML'),('Node.js','Backend'),('Java','Programming'),
  ('TypeScript','Frontend'),('Docker','DevOps'),('Figma','Design'),
  ('Excel','Analytics'),('C++','Programming'),('Django','Backend'),
  ('Flutter','Mobile'),('AWS','Cloud'),('MongoDB','Database')
ON CONFLICT DO NOTHING;
`;

const RLS = `
ALTER TABLE student ENABLE ROW LEVEL SECURITY;
ALTER TABLE company ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_skill ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE application ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "skill_read" ON skill;
DROP POLICY IF EXISTS "internship_read" ON internship;
DROP POLICY IF EXISTS "internship_req_read" ON internship_requirements;
DROP POLICY IF EXISTS "company_read" ON company;
DROP POLICY IF EXISTS "company_insert_own" ON company;
DROP POLICY IF EXISTS "company_update_own" ON company;
DROP POLICY IF EXISTS "student_insert_own" ON student;
DROP POLICY IF EXISTS "student_select_own" ON student;
DROP POLICY IF EXISTS "student_update_own" ON student;
DROP POLICY IF EXISTS "student_admin_read" ON student;
DROP POLICY IF EXISTS "student_skill_own" ON student_skill;
DROP POLICY IF EXISTS "student_skill_admin_read" ON student_skill;
DROP POLICY IF EXISTS "application_own" ON application;
DROP POLICY IF EXISTS "application_admin_read" ON application;

CREATE POLICY "skill_read" ON skill FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "internship_read" ON internship FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "internship_req_read" ON internship_requirements FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "company_read" ON company FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "company_insert_own" ON company FOR INSERT WITH CHECK (auth.uid() = company_id);
CREATE POLICY "company_update_own" ON company FOR UPDATE USING (auth.uid() = company_id);
CREATE POLICY "student_insert_own" ON student FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "student_select_own" ON student FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "student_update_own" ON student FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "student_admin_read" ON student FOR SELECT USING (EXISTS (SELECT 1 FROM admin WHERE admin_id = auth.uid()));
CREATE POLICY "student_skill_own" ON student_skill FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "student_skill_admin_read" ON student_skill FOR SELECT USING (EXISTS (SELECT 1 FROM admin WHERE admin_id = auth.uid()));
CREATE POLICY "application_own" ON application FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "application_admin_read" ON application FOR SELECT USING (EXISTS (SELECT 1 FROM admin WHERE admin_id = auth.uid()));
`;

async function run() {
  console.log(`🔄 Project: ${PROJECT_REF}`);
  console.log('🔄 Applying schema...');
  await runSQL(SCHEMA);
  console.log('✅ All 7 tables created + 15 skills seeded');

  console.log('🔄 Applying RLS policies...');
  await runSQL(RLS);
  console.log('✅ RLS policies applied');

  console.log('\n🎉 Done! Run: node test-live.mjs');
}

run().catch(e => { console.error('❌', e.message); process.exit(1); });
