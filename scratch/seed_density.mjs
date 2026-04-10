import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedDensity() {
  console.log('--- SEEDING PRODUCT DENSITY (v2) ---');

  // 1. Seed Companies (with UUIDs)
  const companies = [
    { company_id: uuidv4(), company_name: 'Stripe', industry: 'Fintech', location: 'San Francisco', is_verified: true, email: 'hiring@stripe.com' },
    { company_id: uuidv4(), company_name: 'Vercel', industry: 'Cloud Computing', location: 'Remote', is_verified: true, email: 'careers@vercel.com' },
    { company_id: uuidv4(), company_name: 'Slack', industry: 'Collaboration', location: 'New York', is_verified: true, email: 'jobs@slack.com' },
    { company_id: uuidv4(), company_name: 'OpenAI', industry: 'Artificial Intelligence', location: 'SF', is_verified: true, email: 'talent@openai.com' },
    { company_id: uuidv4(), company_name: 'Atlassian', industry: 'Project Management', location: 'Sydney', is_verified: true, email: 'hiring@atlassian.com' }
  ];

  console.log('Seeding Companies...');
  for (const c of companies) {
    const { data: existing } = await supabase.from('company').select('company_id').eq('company_name', c.company_name).maybeSingle();
    if (!existing) {
        console.log(`Inserting ${c.company_name}...`);
        const { error } = await supabase.from('company').insert(c);
        if (error) console.error(`Failed to insert ${c.company_name}:`, error.message);
    } else {
        console.log(`Company ${c.company_name} already exists.`);
    }
  }

  const { data: allComps } = await supabase.from('company').select('*');
  const compMap = Object.fromEntries(allComps.map(c => [c.company_name, c.company_id]));

  // 2. Seed Internships
  const internshipsData = [
    { company_id: compMap['Stripe'], title: 'Backend Systems Intern', description: 'Scale payments APIs using Go and Distributed Systems.', internship_type: 'Remote', openings: 5, deadline: '2026-12-31', perks: 'Relocation Assistance, Mentorship', duration: '6 Months', stipend: '1000 USD/Month' },
    { company_id: compMap['Vercel'], title: 'Frontend Core Intern', description: 'Work on Next.js core features and DX.', internship_type: 'Remote', openings: 2, deadline: '2026-11-30', perks: 'Laptop, Stock Options', duration: '3 Months', stipend: 'Competitive' },
    { company_id: compMap['Slack'], title: 'Product Design Intern', description: 'Redefining team communication interfaces.', internship_type: 'Hybrid', openings: 3, deadline: '2026-10-15', perks: 'Lunch, Learning Budget', duration: '6 Months', stipend: 'Paid' },
    { company_id: compMap['OpenAI'], title: 'Model Safety Intern', description: 'Research and evaluate AI safety mechanisms.', internship_type: 'On-site', openings: 1, deadline: '2026-09-01', perks: 'Housing Reimbursement', duration: '12 Months', stipend: 'High' },
    { company_id: compMap['Atlassian'], title: 'Fullstack Growth Intern', description: 'Building features for millions of Jira users.', internship_type: 'Remote', openings: 10, deadline: '2026-08-30', perks: 'Flexible Hours', duration: '6 Months', stipend: '900 USD/Month' }
  ];

  console.log('Seeding Internships...');
  for (const intern of internshipsData) {
    if (!intern.company_id) continue;
    const { data: existing } = await supabase.from('internship').select('internship_id').eq('title', intern.title).maybeSingle();
    if (!existing) {
      await supabase.from('internship').insert(intern);
    }
  }

  // 3. Seed Events
  const eventsData = [
    { title: 'Nexus Hire: Global Virtual Fair', description: 'Connect with top-tier tech companies across the globe.', start_time: '2026-05-20T10:00:00Z', location: 'SkillSync Virtual Hall', event_type: 'hiring' },
    { title: 'Resume Roast & Workshop', description: 'Get your resume analyzed by AI and industry experts.', start_time: '2026-05-15T16:00:00Z', location: 'Auditorium A', event_type: 'workshop' },
    { title: 'Algorithmic Duel: Code Jam', description: 'Solve hard problems and win internship fast-tracks.', start_time: '2026-06-10T12:00:00Z', location: 'Main Campus Lab', event_type: 'hackathon' }
  ];

  console.log('Seeding Events...');
  for (const event of eventsData) {
    const { data: existing } = await supabase.from('event').select('event_id').eq('title', event.title).maybeSingle();
    if (!existing) {
      await supabase.from('event').insert(event);
    }
  }

  console.log('--- SEEDING COMPLETE ---');
}

seedDensity().catch(console.error);
