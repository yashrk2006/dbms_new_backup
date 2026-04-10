/**
 * VERIFICATION SCRIPT — BoothIQ
 * Checks data flow across Student, Admin, and Company portals.
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SK = process.env.SUPABASE_SERVICE_ROLE_KEY;

const headers = {
  'Content-Type': 'application/json',
  'apikey': SK,
  'Authorization': `Bearer ${SK}`,
};

async function check(name, path) {
  const res = await fetch(`${URL_BASE}${path}`, { headers });
  const data = await res.json();
  if (res.ok) {
    console.log(`✅ ${name}: OK (${Array.isArray(data) ? data.length : 'Object'} records)`);
    return true;
  } else {
    console.error(`❌ ${name}: FAILED`, data);
    return false;
  }
}

async function main() {
  console.log('🔍 Verifying Platform Integrity...');

  // 1. Check Student Directory (Admin View)
  await check('Student Directory', '/rest/v1/student?select=*&limit=5');
  
  // 2. Check Company Directory
  await check('Company Directory', '/rest/v1/company?select=*&limit=5');

  // 3. Check Internships
  await check('Internships', '/rest/v1/internship?select=*&limit=5');

  // 4. Check Applications
  await check('Applications', '/rest/v1/application?select=*&limit=5');

  // 5. Check Stats API (Public/Internal)
  // We'll proxy test the counts
  const { data: companies } = await (await fetch(`${URL_BASE}/rest/v1/company?select=count`, { headers: { ...headers, 'Prefer': 'count=exact' } })).json();
  const { data: internships } = await (await fetch(`${URL_BASE}/rest/v1/internship?select=count`, { headers: { ...headers, 'Prefer': 'count=exact' } })).json();
  
  console.log(`\n📊 System Summary:`);
  console.log(`   - Companies: ${companies ? 'Found' : '0'}`);
  console.log(`   - Internships: ${internships ? 'Found' : '0'}`);

  console.log('\n🏁 Verification Finished');
}

main().catch(console.error);
