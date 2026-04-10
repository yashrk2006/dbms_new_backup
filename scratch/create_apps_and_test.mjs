import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function run() {
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
  console.log("Users in Auth:", users.map(u => u.email).join(', '));
  
  const studentEmail = users.find(u => u.user_metadata?.role === 'student')?.email || 'demo@student.com';
  
  console.log(`Checking student: ${studentEmail}`);
  
  // What internships exist?
  const { data: internships } = await supabaseAdmin.from('internship').select('title, internship_id, company_id');
  console.log("Internships Available:");
  internships.forEach(i => console.log(`- ${i.title} (${i.internship_id})`));
  
  const appleInternship = internships.find(i => i.title.includes('Social Media'));
  if (appleInternship) {
     console.log("SUCCESS: 'Social Media Intern' was found in the database!");
  } else {
     console.log("FAILURE: 'Social Media Intern' NOT FOUND.");
  }
}

run();
