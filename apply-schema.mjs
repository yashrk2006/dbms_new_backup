/**
 * apply-schema.mjs
 * Applies the full SkillSync schema to Supabase using the Management API.
 * Requires: SUPABASE_ACCESS_TOKEN (personal access token from supabase.com/dashboard/account/tokens)
 *
 * Run: node apply-schema.mjs
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const PROJECT_REF = 'cwtyqajzdlfzybnzjpma';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error('❌  Missing SUPABASE_ACCESS_TOKEN in .env.local');
  console.error('   Get it from: https://supabase.com/dashboard/account/tokens');
  console.error('   Add to .env.local: SUPABASE_ACCESS_TOKEN=sbp_...');
  process.exit(1);
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
  console.log('🔄 Applying schema via Supabase Management API...');

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

  console.log('✅ Schema applied successfully');
  console.log('✅ 15 starter skills seeded');
}

run().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
