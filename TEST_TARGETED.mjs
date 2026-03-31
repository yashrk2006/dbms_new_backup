import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testTargetedLookup() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = createClient(supabaseUrl!, serviceKey!);

  console.log('📡 Testing Targeted SkillSync Identity Lookup...');
  try {
    const { data, error } = await supabase.auth.admin.listUsers(); // Let's try one more list to confirm failure
    console.log('List Users Result:', { error: error?.message, code: error?.status });

    // NOW THE TARGETED TEST
    const testEmail = 'kushwahayashraj1@gmail.com';
    const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail && typeof supabase.auth.admin.getUserByEmail === 'function' 
      ? await supabase.auth.admin.listUsers({ // Actually listUsers with filters is often better for v2 compatibility
          filters: { email: testEmail }
        })
      : { data: null, error: 'getUserByEmail not found' };

    console.log('Targeted Filter Result:', { error: userError?.message, found: !!userData });

  } catch (err) {
    console.error('💥 Crash:', err.message);
  }
}

testTargetedLookup();
