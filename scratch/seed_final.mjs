import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Using service role to bypass RLS for seeding
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedDensityFinal() {
  console.log('--- SEEDING FINAL DENSITY (InnovateTech Focus) ---');

  // 1. Get the existing company
  const { data: companies } = await supabase.from('company').select('*').eq('company_name', 'InnovateTech');
  if (!companies || companies.length === 0) {
      console.error('InnovateTech not found. Seeding failed.');
      return;
  }
  const companyId = companies[0].company_id;

  // 2. Add 10 diverse internships for this company
  const internships = [
    { company_id: companyId, title: 'AI Research Intern', description: 'Deep learning and LLM fine-tuning.', internship_type: 'Remote', openings: 2, deadline: '2026-12-01', duration: '6 Months', stipend: '1200 USD' },
    { company_id: companyId, title: 'Fullstack Dev (Next.js)', description: 'Build enterprise dashboards.', internship_type: 'Hybrid', openings: 4, deadline: '2026-11-15', duration: '3 Months', stipend: 'Paid' },
    { company_id: companyId, title: 'Data Analyst', description: 'Institutional data visualization.', internship_type: 'On-site', openings: 1, deadline: '2026-10-30', duration: '6 Months', stipend: 'Competitive' },
    { company_id: companyId, title: 'DevOps Engineer', description: 'Kubernetes and Cloud Infrastructure.', internship_type: 'Remote', openings: 2, deadline: '2026-09-15', duration: '6 Months', stipend: '1000 USD' },
    { company_id: companyId, title: 'UI/UX Designer', description: 'Modernizing recruitment interfaces.', internship_type: 'Remote', openings: 3, deadline: '2026-08-01', duration: '3 Months', stipend: 'Paid' },
    { company_id: companyId, title: 'Cybersecurity Analyst', description: 'Fortifying platform security protocols.', internship_type: 'On-site', openings: 1, deadline: '2026-07-20', duration: '6 Months', stipend: 'High' },
    { company_id: companyId, title: 'Mobile Dev (React Native)', description: 'Campus mobility apps.', internship_type: 'Hybrid', openings: 5, deadline: '2026-06-30', duration: '4 Months', stipend: 'Paid' },
    { company_id: companyId, title: 'Marketing & Outreach', description: 'Connecting students to opportunities.', internship_type: 'Remote', openings: 10, deadline: '2026-05-15', duration: '2 Months', stipend: 'Unpaid (Certificate)' },
    { company_id: companyId, title: 'HR Generalist', description: 'Managing student identity lifecycle.', internship_type: 'On-site', openings: 2, deadline: '2026-04-30', duration: '6 Months', stipend: 'Paid' },
    { company_id: companyId, title: 'API Integration Specialist', description: 'Linking database silos.', internship_type: 'Remote', openings: 1, deadline: '2026-11-01', duration: '6 Months', stipend: '900 USD' }
  ];

  console.log(`Seeding ${internships.length} internships for InnovateTech...`);
  for (const intern of internships) {
    const { data: existing } = await supabase.from('internship').select('internship_id').eq('title', intern.title).maybeSingle();
    if (!existing) {
        await supabase.from('internship').insert(intern);
    }
  }

  // 3. Map Skills
  const { data: allSkills } = await supabase.from('skill').select('*');
  const { data: allInterns } = await supabase.from('internship').select('*').eq('company_id', companyId);
  
  const skillMap = Object.fromEntries(allSkills.map(s => [s.skill_name, s.skill_id]));
  const mappings = [];

  for (const i of allInterns) {
      if (i.title.includes('AI')) mappings.push({ internship_id: i.internship_id, skill_id: skillMap['Machine Learning'] || allSkills[0].skill_id });
      if (i.title.includes('Fullstack')) mappings.push({ internship_id: i.internship_id, skill_id: skillMap['React'] || allSkills[1].skill_id });
      if (i.title.includes('API')) mappings.push({ internship_id: i.internship_id, skill_id: skillMap['SQL'] || allSkills[2].skill_id });
  }

  console.log(`Updating ${mappings.length} skill connections...`);
  await supabase.from('internship_skill').upsert(mappings, { onConflict: 'internship_id,skill_id' });

  console.log('--- FINAL SEEDING COMPLETE ---');
}

seedDensityFinal().catch(console.error);
