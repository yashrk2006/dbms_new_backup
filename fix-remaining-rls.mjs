import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env.local') });

import pg from 'pg';
const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const SQL = `
-- Ensure student_skill is fully open (insert + select)
ALTER TABLE student_skill DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE student_skill TO anon, authenticated, service_role;

-- Ensure student table allows upserts from service_role
GRANT ALL ON TABLE student TO anon, authenticated, service_role;

-- Ensure application table allows inserts
ALTER TABLE application DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE application TO anon, authenticated, service_role;

-- Ensure notification table is open for writes
GRANT ALL ON TABLE notification TO anon, authenticated, service_role;

-- Re-verify SEQUENCES
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

SELECT 'RLS fix complete' as status;
`;

async function run() {
  await client.connect();
  const res = await client.query(SQL);
  console.log('✅', res[res.length-1]?.rows?.[0]?.status || 'Done');
  await client.end();
}

run().catch(e => { console.error(e.message); client.end(); });
