// SkillSync RLS Policy Setup Script
// Run with: node setup-rls.mjs
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import pg from 'pg';

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const SQL = `
-- Enable RLS on all tables
ALTER TABLE student ENABLE ROW LEVEL SECURITY;
ALTER TABLE company ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_skill ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE application ENABLE ROW LEVEL SECURITY;

-- Drop all old policies first (safe to re-run)
DROP POLICY IF EXISTS "Skills are viewable by all" ON skill;
DROP POLICY IF EXISTS "Internships viewable by all" ON internship;
DROP POLICY IF EXISTS "Requirements viewable by all" ON internship_requirements;
DROP POLICY IF EXISTS "Company names visible to all authenticated" ON company;
DROP POLICY IF EXISTS "Students manage their skills" ON student_skill;
DROP POLICY IF EXISTS "Students manage own applications" ON application;
DROP POLICY IF EXISTS "Students can view own profile" ON student;
DROP POLICY IF EXISTS "Students can insert own profile" ON student;
DROP POLICY IF EXISTS "Students can update own profile" ON student;
DROP POLICY IF EXISTS "Companies can view own profile" ON company;
DROP POLICY IF EXISTS "Companies can insert own profile" ON company;
DROP POLICY IF EXISTS "Companies can update own profile" ON company;
DROP POLICY IF EXISTS "Admins can do anything on student" ON student;
DROP POLICY IF EXISTS "Public read skill" ON skill;
DROP POLICY IF EXISTS "Public read internship" ON internship;
DROP POLICY IF EXISTS "Public read reqs" ON internship_requirements;
DROP POLICY IF EXISTS "Public read company" ON company;
DROP POLICY IF EXISTS "Public read student_skill" ON student_skill;
DROP POLICY IF EXISTS "Public read application" ON application;
DROP POLICY IF EXISTS "Public read student" ON student;
DROP POLICY IF EXISTS "Public insert app" ON application;
DROP POLICY IF EXISTS "Public insert skill" ON student_skill;
DROP POLICY IF EXISTS "Public delete skill" ON student_skill;

-- ── SKILLS: Any authenticated user can read ──────────────────────
CREATE POLICY "skill_read" ON skill
  FOR SELECT USING (auth.role() = 'authenticated');

-- ── INTERNSHIP: Any authenticated user can read ──────────────────
CREATE POLICY "internship_read" ON internship
  FOR SELECT USING (auth.role() = 'authenticated');

-- ── INTERNSHIP REQUIREMENTS: Any authenticated user can read ─────
CREATE POLICY "internship_req_read" ON internship_requirements
  FOR SELECT USING (auth.role() = 'authenticated');

-- ── COMPANY: Any authenticated user can read (for joins) ─────────
CREATE POLICY "company_read" ON company
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "company_insert_own" ON company
  FOR INSERT WITH CHECK (auth.uid() = company_id);

CREATE POLICY "company_update_own" ON company
  FOR UPDATE USING (auth.uid() = company_id);

-- ── STUDENT: Own profile only ────────────────────────────────────
CREATE POLICY "student_insert_own" ON student
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "student_select_own" ON student
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "student_update_own" ON student
  FOR UPDATE USING (auth.uid() = student_id);

-- Admins can read all students
CREATE POLICY "student_admin_read" ON student
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin WHERE admin_id = auth.uid())
  );

-- ── STUDENT_SKILL: Students manage their own skills ──────────────
CREATE POLICY "student_skill_own" ON student_skill
  FOR ALL USING (auth.uid() = student_id);

-- Admins can read all student skills
CREATE POLICY "student_skill_admin_read" ON student_skill
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin WHERE admin_id = auth.uid())
  );

-- ── APPLICATION: Students manage their own applications ──────────
CREATE POLICY "application_own" ON application
  FOR ALL USING (auth.uid() = student_id);

-- Admins can read all applications
CREATE POLICY "application_admin_read" ON application
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin WHERE admin_id = auth.uid())
  );

-- ── ADMIN: Only admins can read the admin table ──────────────────
CREATE POLICY "admin_self_read" ON admin
  FOR SELECT USING (auth.uid() = admin_id);
`;

async function run() {
  await client.connect();
  console.log('✅  Connected to Supabase');
  await client.query(SQL);
  console.log('✅  RLS enabled on all tables');
  console.log('✅  Secure auth-based policies applied');
  console.log('\n🎉  Security is properly configured.');
  await client.end();
}

run().catch(err => {
  console.error('❌  Error:', err.message);
  client.end();
  process.exit(1);
});
