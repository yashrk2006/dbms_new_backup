import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runAudit() {
  console.log('--- BOOTHIQ FINAL AUDIT: DATA & SECURITY ---');

  // 1. Check Student Population
  const { count: studentCount } = await supabaseAdmin.from('student').select('*', { count: 'exact', head: true });
  const { count: directoryCount } = await supabaseAdmin.from('college_directory').select('*', { count: 'exact', head: true });
  console.log(`[STUDENTS] Registered: ${studentCount} | Global Directory: ${directoryCount}`);

  // 2. Check Recruitment Density
  const { count: internshipCount } = await supabaseAdmin.from('internship').select('*', { count: 'exact', head: true });
  const { count: companyCount } = await supabaseAdmin.from('company').select('*', { count: 'exact', head: true });
  console.log(`[HIRING] Total Companies: ${companyCount} | Live Internships: ${internshipCount}`);

  // 3. Check Institutional Identities
  const { data: samples } = await supabaseAdmin.from('student').select('name, roll_no').not('roll_no', 'is', null).limit(3);
  console.log('[IDENTITY] Sample Institutional Mappings:');
  samples?.forEach(s => console.log(`  - ${s.name}: Roll [${s.roll_no}]`));

  // 4. Check Skill Mappings
  const { count: skillLinkCount } = await supabaseAdmin.from('internship_skill').select('*', { count: 'exact', head: true });
  console.log(`[INTEL] Internship-Skill Connections: ${skillLinkCount}`);

  // 5. Check Global Events
  const { count: eventCount } = await supabaseAdmin.from('event').select('*', { count: 'exact', head: true });
  console.log(`[CAMPUS] Active Events/Workshops: ${eventCount}`);

  console.log('--- AUDIT COMPLETE ---');
}

runAudit().catch(console.error);
