import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  
  console.log('\n--- RLS Verification (pg_tables) ---');
  const rls = await client.query(`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE public.pg_tables.schemaname = 'public' 
    AND tablename IN ('student', 'company', 'admin', 'skill', 'internship', 'application');
  `);
  console.table(rls.rows);

  console.log('\n--- Active Policies ---');
  const policies = await client.query(`
    SELECT tablename, policyname, roles, cmd, qual
    FROM pg_policies 
    WHERE schemaname = 'public';
  `);
  console.table(policies.rows);

  console.log('\n--- Roles and Table Privileges ---');
  const privs = await client.query(`
    SELECT grantee, table_name, privilege_type 
    FROM information_schema.role_table_grants 
    WHERE table_schema = 'public' 
    AND table_name IN ('student', 'application')
    AND grantee IN ('anon', 'authenticated');
  `);
  console.table(privs.rows);

  await client.end();
}

run().catch(console.error);
