import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;

async function runReset() {
  console.log('📡 Connecting to SkillSync Neural Engine (Supabase)...');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connection established.');

    const sqlFile = './APPLY_THIS_SQL.sql';
    console.log(`📂 Reading schematic reset from ${sqlFile}...`);
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('🚀 Executing COMPLETE SCHEMATIC RESET (v2.3)...');
    await client.query(sql);

    console.log('✨ Schematic reset successful! Unified Core + Identity deployed.');
  } catch (err) {
    console.error('💥 Reset Failed:', err.message);
    if (err.detail) console.error('🔍 Detail:', err.detail);
    if (err.hint) console.error('💡 Hint:', err.hint);
  } finally {
    await client.end();
  }
}

runReset();
