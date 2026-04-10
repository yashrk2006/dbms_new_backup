import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  console.log('--- AUTH.USERS ---');
  const resUsers = await client.query('SELECT id, email FROM auth.users WHERE email IN (\'admin@skillsync.com\', \'demo@student.com\', \'tech@innovate.com\')');
  console.table(resUsers.rows);

  console.log('--- COLLEGE_DIRECTORY ---');
  const resDir = await client.query('SELECT roll_no, name FROM college_directory');
  console.table(resDir.rows);

  console.log('--- PUBLIC.STUDENT ---');
  const resStudents = await client.query('SELECT student_id, email FROM student');
  console.table(resStudents.rows);

  await client.end();
}

check();
