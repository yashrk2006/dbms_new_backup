import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  console.log('--- AUTH.USERS ---');
  const resUsers = await client.query('SELECT id, email, confirmed_at FROM auth.users');
  console.table(resUsers.rows);

  console.log('--- PUBLIC.STUDENT ---');
  const resStudents = await client.query('SELECT student_id, email, name FROM student');
  console.table(resStudents.rows);

  console.log('--- PUBLIC.ADMIN ---');
  const resAdmins = await client.query('SELECT admin_id, email FROM admin');
  console.table(resAdmins.rows);

  console.log('--- PUBLIC.PROFILES (VIEW) ---');
  const resProfiles = await client.query('SELECT * FROM profiles');
  console.table(resProfiles.rows);

  await client.end();
}

check();
