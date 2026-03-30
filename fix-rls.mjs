import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import pg from 'pg';

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const SQL = `
DROP POLICY IF EXISTS "demo_insert_internship" ON internship;
CREATE POLICY "demo_insert_internship" ON internship FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "demo_update_internship" ON internship;
CREATE POLICY "demo_update_internship" ON internship FOR UPDATE USING (true);

DROP POLICY IF EXISTS "demo_delete_internship" ON internship;
CREATE POLICY "demo_delete_internship" ON internship FOR DELETE USING (true);

DROP POLICY IF EXISTS "demo_insert_req" ON internship_requirements;
CREATE POLICY "demo_insert_req" ON internship_requirements FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "demo_delete_req" ON internship_requirements;
CREATE POLICY "demo_delete_req" ON internship_requirements FOR DELETE USING (true);
`;

async function run() {
  await client.connect();
  await client.query(SQL);
  console.log('✅ RLS fixed: Insert/Delete policies for internship added.');
  await client.end();
}

run().catch(console.error);
