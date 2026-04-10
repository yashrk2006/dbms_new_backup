import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '.env.local' });

const { Client } = pg;
const DATABASE_URL = process.env.DATABASE_URL;

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function findInconsistencies() {
  await client.connect();
  try {
    const res = await client.query(`
      SELECT 
        u.id, 
        u.email, 
        u.instance_id,
        u.aud,
        COALESCE(u.encrypted_password, '') as pass,
        s.student_id is not null as in_student,
        c.company_id is not null as in_company,
        a.admin_id is not null as in_admin
      FROM auth.users u
      LEFT JOIN student s ON u.id = s.student_id
      LEFT JOIN company c ON u.id = c.company_id
      LEFT JOIN admin a ON u.id = a.admin_id
      WHERE u.email IN ('demo@student.com', 'tech@innovate.com', 'admin@skillsync.com', 'syndicate@demo.com')
    `);
    
    console.log('--- USER CONSISTENCY REPORT ---');
    console.table(res.rows);

    // Also check for users in tables NOT in auth
    const orphans = await client.query(`
      SELECT 'student' as tbl, student_id, email FROM student WHERE student_id NOT IN (SELECT id FROM auth.users)
      UNION ALL
      SELECT 'company' as tbl, company_id, email FROM company WHERE company_id NOT IN (SELECT id FROM auth.users)
      UNION ALL
      SELECT 'admin' as tbl, admin_id, email FROM admin WHERE admin_id NOT IN (SELECT id FROM auth.users)
    `);
    console.log('\n--- ORPHAN PROFILES (Rows in profile tables without auth user) ---');
    console.table(orphans.rows);

  } finally {
    await client.end();
  }
}

findInconsistencies();
