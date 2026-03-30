/**
 * ⚠️  DEMO ONLY — DO NOT RUN IN PRODUCTION
 *
 * This script opens all RLS policies to anonymous/public access.
 * Use setup-rls.mjs for proper auth-based security.
 *
 * Only use this if you need a fully open demo without Supabase Auth.
 * Run with: node setup-public-rls.mjs
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import pg from 'pg';

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const SQL = `
-- Drop secure policies
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
DROP POLICY IF EXISTS "admin_self_read" ON admin;

-- Open everything for anonymous demo access
CREATE POLICY "demo_read_skill" ON skill FOR SELECT USING (true);
CREATE POLICY "demo_read_internship" ON internship FOR SELECT USING (true);
CREATE POLICY "demo_read_reqs" ON internship_requirements FOR SELECT USING (true);
CREATE POLICY "demo_read_company" ON company FOR SELECT USING (true);
CREATE POLICY "demo_read_student" ON student FOR SELECT USING (true);
CREATE POLICY "demo_read_student_skill" ON student_skill FOR SELECT USING (true);
CREATE POLICY "demo_read_application" ON application FOR SELECT USING (true);
CREATE POLICY "demo_insert_application" ON application FOR INSERT WITH CHECK (true);
CREATE POLICY "demo_insert_student_skill" ON student_skill FOR INSERT WITH CHECK (true);
CREATE POLICY "demo_delete_student_skill" ON student_skill FOR DELETE USING (true);
CREATE POLICY "demo_update_student" ON student FOR UPDATE USING (true);
`;

async function run() {
  await client.connect();
  await client.query(SQL);
  console.log('⚠️  DEMO MODE: All tables are publicly accessible (no auth required).');
  console.log('   Run setup-rls.mjs to restore proper security.');
  await client.end();
}

run().catch(console.error);
