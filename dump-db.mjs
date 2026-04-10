import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '.env.local' });

const { Client } = pg;
const DATABASE_URL = process.env.DATABASE_URL;

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function rawDump() {
  await client.connect();
  try {
    console.log('--- ALL AUTH USERS ---');
    const res = await client.query('SELECT id, email, created_at, last_sign_in_at, role, aud FROM auth.users LIMIT 10');
    console.table(res.rows);

    console.log('\n--- SYSTEM TRIGGERS ---');
    const t = await client.query(`
      SELECT tgname, relname
      FROM pg_trigger
      JOIN pg_class ON pg_class.oid = pg_trigger.tgrelid
      WHERE relname = 'users'
    `);
    console.table(t.rows);

  } catch (err) {
    console.error('✅ Dump Fail:', err.message);
  } finally {
    await client.end();
  }
}

rawDump();
