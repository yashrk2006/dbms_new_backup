import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;

async function checkOtpLogs() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('📡 Checking OTP Logs for Roll Number: 24/94076...');
    
    // Check for the most recent log
    const { rows } = await client.query(`
      SELECT * FROM otp_logs 
      ORDER BY created_at DESC 
      LIMIT 1;
    `);

    if (rows.length === 0) {
      console.log('⚠️ No logs found in otp_logs table.');
    } else {
      console.log('✅ Found Recent Log:');
      console.table(rows.map(r => ({
        email: r.email,
        roll_no: r.roll_no,
        otp_code: r.otp_code,
        is_verified: r.is_verified,
        expires_at: r.expires_at,
        created_at: r.created_at
      })));
    }

  } catch (err) {
    console.error('❌ Error checking logs:', err.message);
  } finally {
    await client.end();
  }
}

checkOtpLogs();
