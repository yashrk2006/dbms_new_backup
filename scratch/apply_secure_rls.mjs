import dotenv from 'dotenv';
import pg from 'pg';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const { Client } = pg;
const DATABASE_URL = process.env.DATABASE_URL;

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  const sql = fs.readFileSync('scratch/SECURE_RLS.sql', 'utf8');
  await client.query(sql);
  console.log("RLS Policies updated successfully.");
  await client.end();
}

run();
