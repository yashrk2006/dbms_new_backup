import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function run() {
  console.log("=== Creating Test Application ===");
  
  // 1. Get a student ID. If no auth users, just get one from `student` table.
  const { data: students } = await supabaseAdmin.from('student').select('student_id');
  if (!students || students.length === 0) {
     console.log("No students in DB to mock application for.");
     return;
  }
  const studentId = students[0].student_id;
  
  // 2. Insert application for internship 4
  const { data: app, error } = await supabaseAdmin.from('application').insert([
     { student_id: studentId, internship_id: 4, status: 'Applied', ai_match_score: 95 }
  ]).select();
  
  if (error) {
     console.log("Failed to insert: ", error.message);
  } else {
     console.log("Application inserted: ", app);
  }
  
  console.log("\n=== Checking Admin Visibility ===");
  const { data: adminApps } = await supabaseAdmin.from('application').select('*, internship(title, company(company_name)), student(name)');
  console.log(`Admin sees ${adminApps.length} applications:`);
  adminApps.forEach(a => console.log(`- ${a.student?.name} -> ${a.internship?.title} @ ${a.internship?.company?.company_name}`));
  
  console.log("\n=== Checking Student Privacy (RLS) ===");
  const supabaseAnon = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data: anonApps, error: anonError } = await supabaseAnon.from('application').select('*');
  
  if (anonError) {
     console.log("Anon Error (expected):", anonError.message);
  } else {
     console.log(`Anon user sees ${anonApps?.length || 0} applications.`);
     if (anonApps?.length === 0) {
        console.log("SUCCESS: RLS is active - an unauthenticated / unauthorized context cannot read the applications.");
     } else {
        console.log("WARNING: RLS might be misconfigured! Anon can see applications.");
     }
  }

  // To check student, we'd need to log in as student.
}

run();
