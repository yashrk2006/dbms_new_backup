import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '.env.local' });
const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  const query = process.argv[2] || "SELECT 1;";
  const res = await client.query(query);
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}
run();
