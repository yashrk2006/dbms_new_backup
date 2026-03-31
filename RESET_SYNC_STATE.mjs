import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;

async function resetSyncState() {
  console.log('📡 Unlocking SkillSync Identity Sync State for Roll Number: 24/94076...');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Unlock the most recent 5 attempts (to be safe)
    const { rowCount } = await client.query(`
      UPDATE otp_logs 
      SET is_verified = false 
      WHERE roll_no = '24/94076' 
      AND is_verified = true
      AND created_at > NOW() - INTERVAL '30 minutes';
    `);

    console.log(`🚀 Reset Complete. ${rowCount} previous verification attempts have been UNLOCKED.`);
  } catch (err) {
    console.error('❌ Reset Failed:', err.message);
  } finally {
    await client.end();
  }
}

resetSyncState();
