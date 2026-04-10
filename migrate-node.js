const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  const sql = fs.readFileSync(path.join(process.cwd(), 'ADD_AI_COLUMNS.sql'), 'utf8');
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to Supabase. Executing G-Nexus Migration...');
    await client.query(sql);
    console.log('Migration Successful! AI Columns Provisioned. 100!');
  } catch (err) {
    console.error('Migration Failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
