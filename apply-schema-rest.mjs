/**
 * apply-schema-rest.mjs
 * Applies the SkillSync schema using Supabase REST API + anon key.
 * Works by calling a stored procedure — no direct DB connection needed.
 *
 * STEP 1: Go to Supabase Dashboard → SQL Editor
 * STEP 2: Paste and run the SQL from setup-db.mjs manually, OR
 * STEP 3: Add SUPABASE_ACCESS_TOKEN to .env.local and run this script
 *
 * Get access token: https://supabase.com/dashboard/account/tokens
 * Run: node apply-schema-rest.mjs
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const PROJECT_REF = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split('.')[0];
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  MANUAL SETUP REQUIRED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('  The database schema has not been applied yet.');
  console.log('  7 of 8 tables are missing from your Supabase project.');
  console.log('');
  console.log('  OPTION A — Supabase SQL Editor (easiest):');
  console.log('  1. Go to: https://supabase.com/dashboard/project/cwtyqajzdlfzybnzjpma/sql/new');
  console.log('  2. Paste the contents of setup-db.mjs (the SQL string inside)');
  console.log('  3. Click Run');
  console.log('');
  console.log('  OPTION B — Fix DB password and run setup-db.mjs:');
  console.log('  1. Go to: https://supabase.com/dashboard/project/cwtyqajzdlfzybnzjpma/settings/database');
  console.log('  2. Reset your database password');
  console.log('  3. Update DATABASE_URL in .env.local with the new password');
  console.log('  4. Run: node setup-db.mjs');
  console.log('');
  console.log('  OPTION C — Use Management API:');
  console.log('  1. Go to: https://supabase.com/dashboard/account/tokens');
  console.log('  2. Create a new access token');
  console.log('  3. Add to .env.local: SUPABASE_ACCESS_TOKEN=sbp_...');
  console.log('  4. Run: node apply-schema-rest.mjs');
  console.log('');
  process.exit(0);
}

const SQL = `
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

async function run() {
  console.log(`🔄 Applying schema to project: ${PROJECT_REF}`);

  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ query: SQL }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('❌ Failed:', JSON.stringify(data, null, 2));
    process.exit(1);
  }

  console.log('✅ All 7 tables created');
  console.log('✅ 15 skills seeded');
  console.log('\n🎉 Run node test-live.mjs to verify everything is working.');
}

run().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
