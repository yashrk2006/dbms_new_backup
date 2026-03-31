import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;

async function updatePolicies() {
  console.log('📡 Updating Database Policies for Public Identity Verification...');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // 1. Allow Anon role to read the directory for verification
    console.log('🛠️ Granting Public Read access to College Directory...');
    await client.query(`
      CREATE POLICY "public_select_directory" 
      ON college_directory 
      FOR SELECT 
      USING (true);
    `);

    // 2. Allow Anon role to log OTP sessions
    console.log('🛠️ Granting Public Insert access to OTP Logs...');
    await client.query(`
      CREATE POLICY "public_insert_otp" 
      ON otp_logs 
      FOR INSERT 
      WITH CHECK (true);
    `);

    await client.query(`
      CREATE POLICY "public_select_otp" 
      ON otp_logs 
      FOR SELECT 
      USING (true);
    `);

    console.log('🚀 Policies Updated. Identity Lookup is now active for public verification!');
  } catch (err) {
    if (err.message.includes('already exists')) {
       console.log('✅ Policies already present. Proceeding...');
    } else {
       console.error('❌ Policy Update Failed:', err.message);
    }
  } finally {
    await client.end();
  }
}

updatePolicies();
