import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedMappings() {
  console.log('--- SEEDING INTERNSHIP-SKILL MAPPINGS & APPLICATIONS ---');

  const { data: internships } = await supabase.from('internship').select('*');
  const { data: skills } = await supabase.from('skill').select('*');
  const { data: students } = await supabase.from('student').select('*').limit(5);

  if (!internships || !skills) return;

  const skillMap = Object.fromEntries(skills.map(s => [s.skill_name, s.skill_id]));

  // 1. Map Skills to Internships
  const mappings = [];
  for (const intern of internships) {
    if (intern.title.includes('Backend')) mappings.push({ internship_id: intern.internship_id, skill_id: skillMap['Node.js'] || skills[0].skill_id });
    if (intern.title.includes('Frontend')) mappings.push({ internship_id: intern.internship_id, skill_id: skillMap['React'] || skills[1].skill_id });
    if (intern.title.includes('Design')) mappings.push({ internship_id: intern.internship_id, skill_id: skillMap['SQL'] || skills[2].skill_id }); // Dummy mapping
  }

  console.log(`Inserting ${mappings.length} skill mappings...`);
  await supabase.from('internship_skill').upsert(mappings, { onConflict: 'internship_id,skill_id' });

  // 2. Map Students to Applications (to populate Admin Dashboard)
  if (students && students.length > 0) {
    const apps = [];
    for (const student of students) {
        // Apply to 2 random internships
        const randomInts = [...internships].sort(() => 0.5 - Math.random()).slice(0, 2);
        for (const i of randomInts) {
            apps.push({
                student_id: student.student_id,
                internship_id: i.internship_id,
                status: 'applied',
                applied_date: new Date().toISOString()
            });
        }
    }
    console.log(`Inserting ${apps.length} applications...`);
    await supabase.from('application').upsert(apps, { onConflict: 'student_id,internship_id' });
  }

  console.log('--- MAPPINGS COMPLETE ---');
}

seedMappings().catch(console.error);
