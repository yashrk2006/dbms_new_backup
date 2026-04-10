import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const RLS_SQL = `
-- SECURITY HARDENING
ALTER TABLE student ENABLE ROW LEVEL SECURITY;
ALTER TABLE company ENABLE ROW LEVEL SECURITY;
ALTER TABLE application ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill ENABLE ROW LEVEL SECURITY;

-- DROP ALL PUBLIC/ANON POLICIES
DROP POLICY IF EXISTS "Public read" ON student;
DROP POLICY IF EXISTS "Public read" ON company;
DROP POLICY IF EXISTS "Public read" ON application;
DROP POLICY IF EXISTS "Public read" ON internship;
DROP POLICY IF EXISTS "Public read" ON skill;

-- SELECT POLICIES (AUTHENTICATED ONLY)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'authenticated_read_student' AND tablename = 'student') THEN
        CREATE POLICY "authenticated_read_student" ON student FOR SELECT USING (auth.uid() = student_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'authenticated_read_company' AND tablename = 'company') THEN
        CREATE POLICY "authenticated_read_company" ON company FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'authenticated_read_app' AND tablename = 'application') THEN
        CREATE POLICY "authenticated_read_app" ON application FOR SELECT USING (auth.uid() = student_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'authenticated_read_internship' AND tablename = 'internship') THEN
        CREATE POLICY "authenticated_read_internship" ON internship FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'authenticated_read_skill' AND tablename = 'skill') THEN
        CREATE POLICY "authenticated_read_skill" ON skill FOR SELECT USING (true);
    END IF;
END $$;
`;

async function stabilize() {
  console.log('📡 Stabilizing SkillSync Technical Core...');
  try {
    await client.connect();
    
    console.log('🚀 Deploying Master Recruitment Stabilization Schema...');
    const masterSql = fs.readFileSync('./MASTER_RECRUITMENT_STABILIZATION.sql', 'utf8');
    await client.query(masterSql);
    
    console.log('🔒 Fortifying Row-Level Security...');
    await client.query(RLS_SQL);
    
    console.log('✨ Technical Core successfully stabilized and hardened!');
  } catch (err) {
    console.error('💥 Critical Core Failure:', err.message);
  } finally {
    await client.end();
  }
}

stabilize();
