/**
 * FULL DATA SEEDER — BoothIQ / SkillSync
 * =========================================
 * Creates a demo student user + profile row + skills + applications
 * so the dashboard shows real data immediately.
 *
 * Run: node seed-full-demo.mjs
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SK = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL_BASE || !SK) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'apikey': SK,
  'Authorization': `Bearer ${SK}`,
};

// ── helpers ──────────────────────────────────────────────────────────────────
async function rest(method, path, body) {
  const res = await fetch(`${URL_BASE}${path}`, {
    method,
    headers: { ...headers, 'Prefer': 'return=representation,resolution=ignore-duplicates' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
  catch { return { ok: res.ok, status: res.status, data: text }; }
}

async function adminAuth(method, path, body) {
  const res = await fetch(`${URL_BASE}/auth/v1${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

// ── STEP 1: Upsert demo student auth user ────────────────────────────────────
async function upsertAuthUser(email, password, role) {
  console.log(`\n🔐  Ensuring auth user: ${email}`);

  // Try to get existing user first
  const listRes = await adminAuth('GET', `/admin/users?email=${encodeURIComponent(email)}`);
  const existing = listRes.data?.users?.find(u => u.email === email);
  if (existing) {
    console.log(`   ✔  Already exists: ${existing.id}`);
    return existing.id;
  }

  const res = await adminAuth('POST', '/admin/users', {
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: email.split('@')[0], role },
    app_metadata: { role },
  });

  if (!res.ok) {
    console.error('   ❌  Auth create failed:', res.data);
    return null;
  }
  console.log(`   ✔  Created user: ${res.data.id}`);
  return res.data.id;
}

// ── STEP 2: Insert student profile ───────────────────────────────────────────
async function insertStudent(userId, data) {
  const res = await rest('POST', '/rest/v1/student', {
    student_id: userId,
    ...data,
  });
  if (!res.ok && !JSON.stringify(res.data).includes('duplicate')) {
    console.error('   ❌  Student insert failed:', res.data);
    return false;
  }
  console.log(`   ✔  Student profile ready for: ${data.name}`);
  return true;
}

// ── STEP 3: Fetch skill IDs by name ──────────────────────────────────────────
async function getSkillIds(names) {
  const filter = names.map(n => `skill_name.eq.${encodeURIComponent(n)}`).join(',');
  const res = await rest('GET', `/rest/v1/skill?or=(${filter})&select=skill_id,skill_name`);
  if (!res.ok) { console.error('   ❌  Skill fetch failed:', res.data); return []; }
  return res.data || [];
}

// ── STEP 4: Assign skills to student ─────────────────────────────────────────
async function assignSkills(studentId, skillIds) {
  for (const { skill_id } of skillIds) {
    await rest('POST', '/rest/v1/student_skill', {
      student_id: studentId,
      skill_id,
      proficiency_level: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
    });
  }
  console.log(`   ✔  ${skillIds.length} skills assigned`);
}

// ── STEP 5: Fetch first N internship IDs ─────────────────────────────────────
async function getInternshipIds(limit = 5) {
  const res = await rest('GET', `/rest/v1/internship?select=internship_id&limit=${limit}`);
  if (!res.ok || !Array.isArray(res.data)) return [];
  return res.data.map(i => i.internship_id);
}

// ── STEP 6: Insert applications ──────────────────────────────────────────────
async function insertApplications(studentId, internshipIds) {
  const statuses = ['Pending', 'Under Review', 'Interviewing', 'Accepted'];
  for (let i = 0; i < internshipIds.length; i++) {
    await rest('POST', '/rest/v1/application', {
      student_id: studentId,
      internship_id: internshipIds[i],
      status: statuses[i % statuses.length],
      applied_date: new Date(Date.now() - i * 86400000 * 3).toISOString().split('T')[0],
      ai_match_score: Math.floor(Math.random() * 30) + 65,
    });
  }
  console.log(`   ✔  ${internshipIds.length} sample applications inserted`);
}

// ── STEP 7: Insert admin profile ─────────────────────────────────────────────
async function insertAdmin(userId, name, email) {
  const res = await rest('POST', '/rest/v1/admin', {
    admin_id: userId,
    name,
    email,
    institution: 'BoothIQ Institute of Technology',
    role: 'super_admin',
  });
  if (!res.ok && !JSON.stringify(res.data).includes('duplicate')) {
    console.log(`   ⚠  Admin insert note (may already exist): ${JSON.stringify(res.data).slice(0, 80)}`);
  } else {
    console.log(`   ✔  Admin profile ready: ${name}`);
  }
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀  BoothIQ Full Data Seeder\n' + '='.repeat(40));

  // --- Demo Student ---
  const studentId = await upsertAuthUser('demo@student.com', 'demo123456', 'student');
  if (studentId) {
    await insertStudent(studentId, {
      name: 'Demo Student',
      email: 'demo@student.com',
      college: 'BoothIQ Institute of Technology',
      branch: 'Computer Science',
      graduation_year: 2025,
    });

    const skills = await getSkillIds(['React', 'JavaScript', 'Python', 'Node.js', 'TypeScript', 'SQL', 'Machine Learning']);
    if (skills.length > 0) await assignSkills(studentId, skills);

    const internshipIds = await getInternshipIds(5);
    if (internshipIds.length > 0) await insertApplications(studentId, internshipIds);
  }

  // --- Extra Test Students (populates admin Student Directory) ---
  const extraStudents = [
    { email: 'alice@student.com', name: 'Alice Johnson', branch: 'AI & Data Science', graduationYear: 2025 },
    { email: 'bob@student.com',   name: 'Bob Smith',     branch: 'Software Engineering', graduationYear: 2026 },
    { email: 'cara@student.com',  name: 'Cara Davis',    branch: 'Cybersecurity',    graduationYear: 2025 },
    { email: 'dan@student.com',   name: 'Dan Lee',        branch: 'Cloud Computing', graduationYear: 2026 },
  ];

  const extraSkillSets = [
    ['Python', 'Machine Learning', 'TensorFlow', 'Data Visualization'],
    ['React', 'Node.js', 'Docker', 'PostgreSQL'],
    ['Python', 'SQL', 'AWS', 'CI/CD'],
    ['AWS', 'Kubernetes', 'Terraform', 'Docker'],
  ];

  for (let i = 0; i < extraStudents.length; i++) {
    const { email, name, branch, graduationYear } = extraStudents[i];
    const uid = await upsertAuthUser(email, 'student123456', 'student');
    if (uid) {
      await insertStudent(uid, {
        name, email, college: 'BoothIQ Institute of Technology',
        branch, graduation_year: graduationYear
      });
      const skills = await getSkillIds(extraSkillSets[i]);
      if (skills.length > 0) await assignSkills(uid, skills);
      const internshipIds = await getInternshipIds(3);
      if (internshipIds.length > 0) await insertApplications(uid, internshipIds);
    }
  }

  // --- Admin Account ---
  const adminId = await upsertAuthUser('admin@skillsync.com', 'admin123456', 'admin');
  if (adminId) {
    await insertAdmin(adminId, 'Platform Administrator', 'admin@skillsync.com');
  }

  console.log('\n' + '='.repeat(40));
  console.log('✅  Seeding complete!');
  console.log('\n📋  Login Credentials:');
  console.log('   Student:  demo@student.com     / demo123456');
  console.log('   Admin:    admin@skillsync.com  / admin123456');
  console.log('\n🌐  Visit: http://localhost:3000/auth/login');
}

main().catch(err => { console.error('❌  Fatal:', err.message); process.exit(1); });
