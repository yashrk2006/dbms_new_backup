import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fortify() {
  console.log('📡 Fortifying SkillSync Technical Core (RLS Master Reset)...');
  try {
    await client.connect();
    console.log('✅ Connected to database.');
    
    const sql = fs.readFileSync('./FORTIFY_RLS.sql', 'utf8');
    await client.query(sql);
    
    console.log('🔒 Row-Level Security (RLS) successfully fortified!');
    console.log('🚀 Anonymous access to sensitive data is now blocked.');
  } catch (err) {
    console.error('❌ Fortification Failed:', err.message);
  } finally {
    await client.end();
  }
}

fortify();
