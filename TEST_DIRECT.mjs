import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testDirectAuthRead() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ Missing DATABASE_URL');
    return;
  }

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  console.log('📡 Testing Direct Identity Lookup via Postgres (SkillSync Bypass)...');
  try {
    await client.connect();
    
    // Attempting a direct read of the auth schema
    const email = 'kushwahayashraj1@gmail.com';
    const { rows } = await client.query('SELECT id, email FROM auth.users WHERE email = $1', [email.toLowerCase()]);
    
    if (rows.length > 0) {
      console.log('✅ Identity Discovery Success (Direct Bypass)! Found user:', rows[0].id);
    } else {
      console.log('ℹ️ Identity not found in Auth schema (This is normal for new users). Identity bridging will proceed to creation.');
    }
  } catch (err) {
    console.error('❌ Direct Identity Lookup Failed:', err.message);
  } finally {
    await client.end();
  }
}

testDirectAuthRead();
