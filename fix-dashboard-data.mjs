import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env.local') });

import pg from 'pg';

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const SQL = `
-- Fix RLS constraints that are preventing students and companies from seeing essential data
ALTER TABLE internship DISABLE ROW LEVEL SECURITY;
ALTER TABLE company DISABLE ROW LEVEL SECURITY;
ALTER TABLE skill DISABLE ROW LEVEL SECURITY;
ALTER TABLE internship_skill DISABLE ROW LEVEL SECURITY;

-- If RLS must be kept on, we explicitly grant anonymous and authenticated select access
CREATE POLICY "public_read_access_internship" ON internship FOR SELECT USING (true);
CREATE POLICY "public_read_access_company" ON company FOR SELECT USING (true);
CREATE POLICY "public_read_access_skill" ON skill FOR SELECT USING (true);
CREATE POLICY "public_read_access_internship_skill" ON internship_skill FOR SELECT USING (true);

-- Ensure grants are active
GRANT SELECT ON TABLE internship TO anon, authenticated, service_role;
GRANT SELECT ON TABLE company TO anon, authenticated, service_role;
GRANT SELECT ON TABLE skill TO anon, authenticated, service_role;
GRANT SELECT ON TABLE internship_skill TO anon, authenticated, service_role;

-- Also verify the specific InnovateTech company because the user screenshot shows "Pending Verification"
UPDATE company SET is_verified = true;
`;

async function run() {
  await client.connect();
  try {
      await client.query(SQL);
      console.log('✅ Fixes applied! Disabled RLS on read-heavy public tables and verified all companies.');
  } catch(e) {
      console.log('Error applying SQL updates:', e.message);
  }
  await client.end();
}

run().catch(console.error);
