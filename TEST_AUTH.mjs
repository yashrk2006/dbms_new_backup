import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testAuthAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing credentials in .env.local');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('📡 Testing SkillSync Auth Admin Connectivity...');
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Auth Admin Failed:', error.message);
      console.error('Code:', error.status);
    } else {
      console.log('✅ Auth Admin Success! Found', data.users.length, 'users.');
    }
  } catch (err) {
    console.error('💥 CRITICAL CRASH:', err.message);
  }
}

testAuthAdmin();
