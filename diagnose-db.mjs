import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '.env.local' });

const { Client } = pg;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Missing environment variable DATABASE_URL');
  process.exit(1);
}

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function diagnose() {
  console.log('🔍 Starting Database Diagnostics...');
  
  try {
    await client.connect();

    console.log('\n--- Auth Users Check ---');
    const authUsers = await client.query(`
      SELECT id, email, role, aud, instance_id, (encrypted_password IS NOT NULL AND encrypted_password != '') as has_password
      FROM auth.users
      WHERE email IN ('demo@student.com', 'tech@innovate.com', 'admin@skillsync.com', 'syndicate@demo.com')
    `);
    console.table(authUsers.rows);

    console.log('\n--- Profile Tables Check ---');
    const studentCheck = await client.query("SELECT student_id, email, name FROM student WHERE email IN ('demo@student.com', 'syndicate@demo.com')");
    console.log('Students:');
    console.table(studentCheck.rows);

    const companyCheck = await client.query("SELECT company_id, email, company_name FROM company WHERE email = 'tech@innovate.com'");
    console.log('Companies:');
    console.table(companyCheck.rows);

    const adminCheck = await client.query("SELECT admin_id, email FROM admin WHERE email = 'admin@skillsync.com'");
    console.log('Admins:');
    console.table(adminCheck.rows);

    console.log('\n--- Triggers Check (auth.users) ---');
    const triggers = await client.query(`
      SELECT trigger_name, event_manipulation, event_object_table, action_statement
      FROM information_schema.triggers
      WHERE event_object_table = 'users' AND event_object_schema = 'auth'
    `);
    console.table(triggers.rows);

  } catch (err) {
    console.error('✅ Diagnostic Fail:', err.message);
  } finally {
    await client.end();
  }
}

diagnose();
