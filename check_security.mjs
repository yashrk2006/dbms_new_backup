import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  await client.connect();
  
  console.log('\n--- RLS Status ---');
  const rls = await client.query(`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('student', 'company', 'admin', 'skill', 'internship', 'application');
  `);
  console.table(rls.rows);

  console.log('\n--- Policies on student ---');
  const policies = await client.query(`
    SELECT * FROM pg_policies WHERE schemaname = 'public' AND tablename = 'student';
  `);
  console.table(policies.rows);

  console.log('\n--- Row Counts ---');
  const counts = await client.query(`
    SELECT 
      (SELECT COUNT(*) FROM student) as students,
      (SELECT COUNT(*) FROM company) as companies,
      (SELECT COUNT(*) FROM internship) as internships,
      (SELECT COUNT(*) FROM application) as applications,
      (SELECT COUNT(*) FROM skill) as skills;
  `);
  console.table(counts.rows);

  await client.end();
}

run().catch(console.error);
