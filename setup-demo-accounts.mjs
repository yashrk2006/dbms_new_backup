import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '.env.local' });

const { Client } = pg;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !DATABASE_URL) {
  console.error('❌ Missing environment variables (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL)');
  process.exit(1);
}

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const DEMO_USERS = [
  {
    email: 'admin@skillsync.com',
    password: 'admin123456',
    role: 'admin',
    name: 'Admin Commander'
  },
  {
    email: 'tech@innovate.com',
    password: 'company123456',
    role: 'company',
    name: 'InnovateTech'
  },
  {
    email: 'demo@student.com',
    password: 'demo123456',
    role: 'student',
    name: 'Demo Student'
  }
];

async function setup() {
  console.log('📡 Provisioning SkillSync Demo Identity Matrix...');
  
  try {
    await client.connect();

    for (const user of DEMO_USERS) {
      console.log(`🚀 Processing User: ${user.email} (${user.role})`);

      // 1. Create or get user in auth.users
      const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: { role: user.role, name: user.name }
        }),
      });

      const userData = await res.json();
      const userId = userData.id || userData.user?.id;

      if (!userId && userData.msg === 'A user with this email address has already been registered') {
        console.log(`   ℹ️ Auth user already exists, resolving identity...`);
        // Force reset password for demo consistency
        await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            email: user.email,
            password: user.password,
          }),
        });
        
        // Find existing ID via SQL (direct DB access since admin API lookup is limited)
        const dbIdRes = await client.query('SELECT id FROM auth.users WHERE email = $1', [user.email]);
        const dbId = dbIdRes.rows[0]?.id;
        if (!dbId) throw new Error(`Could not resolve ID for existing user: ${user.email}`);

        // Update profile in respective table
        await syncProfile(dbId, user);
      } else if (userId) {
        console.log(`   ✅ Auth user synchronized: ${userId}`);
        await syncProfile(userId, user);
      } else {
        console.error('   ❌ Error provisioning user:', userData);
      }
    }

    console.log('✨ SkillSync Identity Matrix successfully synchronized!');
  } catch (err) {
    console.error('💥 Critical Provisioning Failure:', err.message);
  } finally {
    await client.end();
  }
}

async function syncProfile(userId, user) {
  if (user.role === 'admin') {
    await client.query(
      'INSERT INTO admin (admin_id, email, role) VALUES ($1, $2, $3) ON CONFLICT (admin_id) DO UPDATE SET email = EXCLUDED.email',
      [userId, user.email, user.role]
    );
  } else if (user.role === 'company') {
    await client.query(
      'INSERT INTO company (company_id, company_name, email, industry, location) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (company_id) DO UPDATE SET company_name = EXCLUDED.company_name, email = EXCLUDED.email',
      [userId, user.name, user.email, 'Technology', 'Global']
    );
  } else if (user.role === 'student') {
    await client.query(
      'INSERT INTO student (student_id, name, email, college, branch, graduation_year) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (student_id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email',
      [userId, user.name, user.email, 'Universal Tech', 'Neural Engineering', 2026]
    );
  }
  console.log(`   🔗 Profile row synchronized in "${user.role}" table.`);
}

setup();
