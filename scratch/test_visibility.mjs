import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function run() {
  console.log("=== Verification Script ===");

  // 1. Check Admin stats (Global Oversight)
  console.log("\n[1] Admin Global Oversight");
  const { count: studentCount } = await supabaseAdmin.from('student').select('*', { count: 'exact', head: true });
  const { count: internshipCount } = await supabaseAdmin.from('internship').select('*', { count: 'exact', head: true });
  const { count: applicationCount } = await supabaseAdmin.from('application').select('*', { count: 'exact', head: true });
  const { count: companyCount } = await supabaseAdmin.from('company').select('*', { count: 'exact', head: true });
  console.log(`Global Counts - Students: ${studentCount}, Companies: ${companyCount}, Internships: ${internshipCount}, Applications: ${applicationCount}`);

  // Fetch recent applications like admin does
  const { data: recentApps } = await supabaseAdmin
      .from('application')
      .select(`
        application_id,
        status,
        student(name),
        internship(title, company(company_name))
      `)
      .limit(5)
      .order('applied_date', { ascending: false });
      
  console.log("\nAdmin Recent Apps feed contains global data:");
  recentApps.forEach(app => {
     console.log(`- ${app.student?.name} applied for "${app.internship?.title}" at ${app.internship?.company?.company_name}`);
  });

  // 2. Student Persona - Data Isolation
  console.log("\n[2] Student Data Isolation (Privacy Audit)");
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
  const demoStudent = users.find(u => u.email === 'demo@student.com');
  
  if (!demoStudent) {
    console.log("Demo student not found.");
  } else {
    console.log(`Evaluating policies for demo student ${demoStudent.email} (${demoStudent.id})`);
    
    // In our app, students call internships GET, which returns all internships, and appends their specific applied boolean.
    // The query for applications in /api/internships/route.ts uses:
    // .eq('student_id', userId)
    
    // To prove they cannot access another student's applications if they tried (RLS test):
    
    // Create an authenticated client for the demo student
    // We will do this by issuing a JWT or just logging in if we have the password. Wait, we set password to demo123456
    const supabaseClient = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
        email: 'demo@student.com',
        password: 'demo123456'
    });
    
    if (authError) {
       console.log("Could not login as demo student: ", authError.message);
    } else {
       console.log(`Successfully acquired auth context for Demo Student.`);
       
       // Try to query applications without filter
       const { data: studentVisibleApps, error: appsError } = await supabaseClient
            .from('application')
            .select('*');
            
       if (appsError) {
          console.log(`Data fetch error (expected if RLS is strict): ${appsError.message}`);
       } else {
          console.log(`The student queried ALL applications. Results returned: ${studentVisibleApps?.length || 0}`);
          const otherStudentsApps = studentVisibleApps.filter(a => a.student_id !== authData.user.id);
          
          if (otherStudentsApps.length > 0) {
             console.log("❌ PRIVACY LEAK: Student can see applications belonging to other students!");
          } else {
             console.log("✅ PRIVACY SECURE: Student can ONLY see their own applications, even when querying the entire table.");
             // Let's verify they see internships
             const { data: internshipsVisible } = await supabaseClient.from('internship').select('title');
             console.log(`✅ VISIBILITY: Student can see ${internshipsVisible?.length || 0} internship postings on the platform.`);
             if (internshipsVisible && internshipsVisible.length > 0) {
                const hasSocialMedia = internshipsVisible.some(i => i.title.includes('Social Media'));
                if (hasSocialMedia) {
                   console.log("✅ INDIVIDUAL POSTING: 'Social Media Intern' is visible to students.");
                } else {
                   console.log("⚠️ POSTING MISSING: 'Social Media Intern' is NOT visible. List:", internshipsVisible.map(i=>i.title));
                }
             }
          }
       }
    }
  }
}

run();
