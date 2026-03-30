/**
 * Seeds a demo student user for local development.
 * Email: demo@student.com  |  Password: demo123456
 *
 * Uses Supabase Admin API (service role key) to create the user properly
 * so the password is correctly hashed by Supabase Auth.
 *
 * Run with: node seed-demo-user.mjs
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  console.error('   Add SUPABASE_SERVICE_ROLE_KEY from your Supabase project settings → API.');
  process.exit(1);
}

async function run() {
  // 1. Create auth user via Supabase Admin API (handles password hashing correctly)
  const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      email: 'demo@student.com',
      password: 'demo123456',
      email_confirm: true,
    }),
  });

  const userData = await createRes.json();

  if (!createRes.ok && userData.msg !== 'A user with this email address has already been registered') {
    console.error('❌  Failed to create auth user:', userData);
    process.exit(1);
  }

  const userId = userData.id || userData.user?.id;
  if (!userId) {
    console.log('ℹ️  User already exists, skipping student row insert.');
    console.log('✅  Demo user ready: demo@student.com / demo123456');
    return;
  }

  // 2. Insert student profile row via REST API
  const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/student`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Prefer': 'resolution=ignore-duplicates',
    },
    body: JSON.stringify({
      student_id: userId,
      name: 'Demo Student',
      email: 'demo@student.com',
      college: 'Demo Tech University',
      branch: 'Computer Science',
      graduation_year: 2025,
    }),
  });

  if (!profileRes.ok) {
    const err = await profileRes.json();
    console.error('❌  Failed to insert student profile:', err);
    process.exit(1);
  }

  console.log('✅  Demo user created: demo@student.com / demo123456');
  console.log('   Student profile row inserted.');
}

run().catch(console.error);
