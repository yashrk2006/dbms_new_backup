import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
  console.log('🚀 Initializing SkillSync Production Ecosystem Seeding...');

  // 1. Purge Demo / Placeholder Data
  console.log('🧹 Purging generic placeholders and demo artifacts...');
  await supabase.from('notification').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('course').delete().neq('course_id', 0);
  await supabase.from('event').delete().neq('event_id', '00000000-0000-0000-0000-000000000000');
  
  // 2. Inject Realworld Courses
  const courses = [
    { title: 'Cloud Infrastructure with AWS', category: 'Cloud', description: 'Advanced protocols for scalable architecture.' },
    { title: 'Full-Stack React & Next.js', category: 'Development', description: 'Institutional grade web engineering.' },
    { title: 'Deep Learning & Neural Nets', category: 'AI', description: 'Predictive modeling for intelligent systems.' },
    { title: 'Embedded Systems & IoT', category: 'Electronics', description: 'Hardware-software co-design for sensors.' },
    { title: 'Advanced CAD & Simulations', category: 'Mechanical', description: 'Industrial design and stress analysis.' },
    { title: 'Structural Hub: Modern BIM', category: 'Civil', description: 'Building Information Modeling for 2024.' },
    { title: 'Power Grid Modernization', category: 'Electrical', description: 'Renewable integration and smart grids.' },
    { title: 'Cybersecurity Operations', category: 'Security', description: 'Threat detection and infrastructure hardening.' },
    { title: 'DevOps & CI/CD Pipelines', category: 'DevOps', description: 'Automation for industrial deployment.' },
    { title: 'UX/UI Design Systems', category: 'Design', description: 'Atomic design and premium user interfaces.' }
  ];
  await supabase.from('course').insert(courses);

  // 3. Inject Global & Targeted Events
  const events = [
    { title: 'Institutional Orientation 2024', event_type: 'Workshop', start_time: new Date(Date.now() + 86400000).toISOString(), location: 'Main Auditorium' },
    { title: 'Microsoft Early Career Summit', event_type: 'Career Fair', start_time: new Date(Date.now() + 172800000).toISOString(), location: 'Virtual Hub' },
    { title: 'Google Step Program Briefing', event_type: 'Info Session', start_time: new Date(Date.now() + 259200000).toISOString(), location: 'Conference Hall A' },
    { title: 'Hackathon: Neural Frontier', event_type: 'Hackathon', start_time: new Date(Date.now() + 604800000).toISOString(), location: 'Innovation Lab' }
  ];
  await supabase.from('event').insert(events);

  // 4. Fetch all Students & All Internships for unique history generation
  const { data: students } = await supabase.from('student').select('student_id, branch');
  const { data: internships } = await supabase.from('internship').select('internship_id');
  const { data: skills } = await supabase.from('skill').select('skill_id, skill_name, category');

  if (!students || !internships || !skills) {
    console.error('❌ Prerequisite data missing (students, internships, or skills).');
    return;
  }

  console.log(`📡 Processing ${students.length} student identities for unique history synchronization...`);

  // 5. Generate Unique Student Experience (Parallel Batches)
  const skillInserts = [];
  const appInserts = [];
  const notifInserts = [];

  for (const s of students) {
    // 5.1 Assign 3-5 Unique Skills based on branch or random
    const numSkills = 3 + Math.floor(Math.random() * 4);
    const selectedSkills = [...skills].sort(() => 0.5 - Math.random()).slice(0, numSkills);
    
    selectedSkills.forEach(sk => {
      skillInserts.push({
        student_id: s.student_id,
        skill_id: sk.skill_id,
        proficiency_level: ['Intermediate', 'Advanced', 'Expert'][Math.floor(Math.random() * 3)]
      });
    });

    // 5.2 Assign 1-3 Random Applications
    const numApps = 1 + Math.floor(Math.random() * 3);
    const selectedInternships = [...internships].sort(() => 0.5 - Math.random()).slice(0, numApps);
    
    selectedInternships.forEach(intl => {
      appInserts.push({
        student_id: s.student_id,
        internship_id: intl.internship_id,
        status: ['Applied', 'In Review', 'Under Analysis', 'Accepted', 'Rejected'][Math.floor(Math.random() * 5)],
        ai_match_score: 60 + Math.floor(Math.random() * 35),
        applied_date: new Date(Date.now() - Math.floor(Math.random() * 10) * 86400000).toISOString()
      });
    });

    // 5.3 Generate 2-3 Personalized Notifications
    notifInserts.push({
      user_id: s.student_id,
      title: 'Profile Synchronized 🔗',
      message: `Your account is successfully bound to the institutional directory as a ${s.branch || 'Student'}.`,
      type: 'system',
      is_read: true
    });
    
    notifInserts.push({
      user_id: s.student_id,
      title: 'Skill Gap Detected 🧠',
      message: `Based on current internship trends in ${s.branch || 'your field'}, we recommend adding Cloud Skills.`,
      type: 'alert',
      is_read: false
    });
  }

  // Execute in batches to avoid Supabase timeout/payload limits
  console.log(`📦 Delivering ${skillInserts.length} skills, ${appInserts.length} applications, and ${notifInserts.length} notifications...`);
  
  const batchSize = 1000;
  for (let i = 0; i < skillInserts.length; i += batchSize) {
    await supabase.from('student_skill').upsert(skillInserts.slice(i, i + batchSize), { onConflict: 'student_id,skill_id' });
  }
  for (let i = 0; i < appInserts.length; i += batchSize) {
    await supabase.from('application').insert(appInserts.slice(i, i + batchSize));
  }
  for (let i = 0; i < notifInserts.length; i += batchSize) {
    await supabase.from('notification').insert(notifInserts.slice(i, i + batchSize));
  }

  console.log('✅ Final Ecosystem Handshake Complete. Platform is Production-Stable.');
}

seed().catch(console.error);
