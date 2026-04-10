import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
  console.log('--- DIAGNOSTIC SCRIPT RUNNING ---');

  // 1. Check Companies
  const { data: companies, error: compErr } = await supabaseAdmin.from('company').select('*');
  console.log('Companies:', companies?.length || 0, compErr ? `Error: ${compErr.message}` : '');
  if (companies?.length > 0) {
     console.log('Sample Company:', JSON.stringify(companies[0]));
  }

  const { data: rlsStatus, error: rlsErr } = await supabaseAdmin.rpc('exec_sql', { sql: "SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'internship';" });
  console.log('RLS Status:', rlsStatus || rlsErr?.message);

  // also try using anon key directly using fetch to bypass any browser client weirdness
  const anonRes = await fetch(`${supabaseUrl}/rest/v1/internship?select=internship_id`, {
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`
    }
  });
  console.log('Anon raw fetch status:', anonRes.status, await anonRes.json());

  if (userErr) {
     console.log('Auth Users Error:', userErr.message);
  }

  const testUserId = users?.users?.[0]?.id || '00000000-0000-0000-0000-000000000000';
  console.log('Testing UPSERT for User ID:', testUserId);

  const { data: updated, error: upsertErr } = await supabaseAdmin
  .from('student')
  .upsert({
    student_id: testUserId,
    email: `diagnostic_${Date.now()}@test.com`,
    name: 'Diagnostic Test',
    college: 'Test College',
    branch: 'Test',
    roll_no: 'TEST-001',
    graduation_year: 2025,
    resume_url: null,
    bio: null
  }, { onConflict: 'student_id' })
  .select()
  .single();

  if (upsertErr) {
    console.error('UPSERT ERROR CAUGHT:', upsertErr.message, upsertErr.details, upsertErr.hint);
  } else {
    console.log('UPSERT SUCCESSFUL. The database schema allows this payload.');
    console.log('Upserted record:', updated);
  }

  console.log('--- DIAGNOSTIC COMPLETE ---');
}

diagnose();
