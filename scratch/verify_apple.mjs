import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function verifyApple() {
  try {
    await client.connect();
    const res = await client.query(
      "UPDATE company SET is_verified = true WHERE email = 'os@apple.com' OR company_id = 'ecdc49e5-d984-4c1f-8f43-e9c2dcdcc524'"
    );
    console.log('✅ Apple company verified. Rows affected:', res.rowCount);
  } catch (err) {
    console.error('❌ Verification failed:', err.message);
  } finally {
    await client.end();
  }
}

verifyApple();
