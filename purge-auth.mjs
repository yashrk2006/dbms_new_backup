import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '.env.local' });

const { Client } = pg;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Missing environment variable DATABASE_URL');
  process.exit(1);
}

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function purge() {
  console.log('🧹 Purging SkillSync Corrupt Identity Matrix...');
  
  try {
    await client.connect();

    // 1. Profile entries (FK cleanup)
    console.log('   - Removing legacy profile rows...');
    await client.query("DELETE FROM public.student WHERE email IN ('demo@student.com', 'syndicate@demo.com')");
    await client.query("DELETE FROM public.company WHERE email = 'tech@innovate.com'");
    await client.query("DELETE FROM public.admin WHERE email = 'admin@skillsync.com'");

    // 2. Auth user entries
    console.log('   - Removing corrupt auth users...');
    await client.query("DELETE FROM auth.users WHERE email IN ('demo@student.com', 'syndicate@demo.com', 'tech@innovate.com', 'admin@skillsync.com')");

    console.log('✅ Identity Matrix successfully purged. Ready for clean provisioning.');
  } catch (err) {
    console.error('💥 Critical Purge Failure:', err.message);
  } finally {
    await client.end();
  }
}

purge();
