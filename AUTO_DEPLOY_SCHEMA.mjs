import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;

async function deploy() {
  console.log('📡 Connecting to PostgreSQL for Institutional Identity Deployment...');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected. Reading SQL Schema...');
    const sql = fs.readFileSync('./INSTITUTIONAL_IDENTITY.sql', 'utf8');
    
    await client.query(sql);
    console.log('🚀 Institutional Identity Schema successfully deployed to Supabase!');
  } catch (err) {
    console.error('❌ Deployment Failed:', err);
  } finally {
    await client.end();
  }
}

deploy();
