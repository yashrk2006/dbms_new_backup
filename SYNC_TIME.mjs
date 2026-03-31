import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;

async function syncTimeTypes() {
  console.log('📡 Synchronizing SkillSync Temporal Types (TIMESTAMP -> TIMESTAMPTZ)...');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Convert expires_at to TIMESTAMPTZ for timezone reliability
    await client.query(`
      ALTER TABLE otp_logs 
      ALTER COLUMN expires_at TYPE TIMESTAMPTZ USING expires_at AT TIME ZONE 'UTC';
    `);

    console.log('🚀 Temporal Sync Complete. SkillSync OTPs are now timezone-aware.');
  } catch (err) {
    console.error('❌ Sync Failed:', err.message);
  } finally {
    await client.end();
  }
}

syncTimeTypes();
