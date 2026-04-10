import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function run() {
  const { data: students } = await supabaseAdmin.from('student').select('student_id, name');
  const student = students[0];
  
  // Clean up existing applications if any
  await supabaseAdmin.from('application').delete().neq('application_id', 0);
  
  // Insert application for "Social Media Intern" (ID 4)
  console.log(`Simulating application for student ${student.name} to Internship 4`);
  const { data: app, error } = await supabaseAdmin.from('application').insert([
     { student_id: student.student_id, internship_id: 4, status: 'Pending', ai_match_score: 95 }
  ]).select();

  if (error) return console.log("Insert failed:", error);
  
  console.log("\n[VERIFICATION: ADMIN OVERSIGHT]");
  const { data: adminApps } = await supabaseAdmin.from('application').select('*, internship(title, company(company_name)), student(name)');
  console.log(`Admin sees ${adminApps.length} application(s):`);
  adminApps.forEach(a => console.log(`  -> ${a.student?.name} applied for [${a.internship?.title}] at [${a.internship?.company?.company_name}]`));

  console.log("\n[VERIFICATION: STUDENT DATA ISOLATION (RLS)]");
  const supabaseAnon = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data: anonApps } = await supabaseAnon.from('application').select('*');
  
  if (!anonApps || anonApps.length === 0) {
      console.log("SUCCESS: Strict RLS enforcement active - anon role cannot query ANY applications.");
  } else {
      console.log("FAIL: Data exposure detected.");
  }

  // To truly verify student privacy, let's login as the student and query
  console.log("\n[VERIFICATION: STUDENT-SPECIFIC SCOPE]");
  const { data: authData, error: authError } = await supabaseAnon.auth.signInWithPassword({
    email: 'demo@student.com',
    password: 'demo123456'
  });

  if (authError) {
     console.log("Could not login as demo student to perform final query: ", authError.message);
  } else {
     const { data: studentApps } = await supabaseAnon.from('application').select('*');
     console.log(`Student role queries ALL applications table. Received ${studentApps?.length || 0} row(s).`);
     const otherApps = studentApps.filter(a => a.student_id !== authData.user.id);
     if (otherApps.length > 0) {
        console.log("FAIL: Student can see applications of OTHER students!");
     } else {
        console.log("SUCCESS: RLS isolates student application data successfully.");
     }
  }
}

run();
