import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '.env.local' });

const { Client } = pg;
const DATABASE_URL = process.env.DATABASE_URL;

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function list() {
  await client.connect();
  try {
    const res = await client.query('SELECT company_name, email, industry FROM company ORDER BY company_name ASC');
    console.log('--- REGISTERED COMPANIES ---');
    console.table(res.rows);
  } finally {
    await client.end();
  }
}

list();
