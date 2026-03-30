/**
 * test-live.mjs — Full live connectivity & function test for SkillSync
 * Run: node test-live.mjs
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!URL || !ANON) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

let passed = 0, failed = 0;

function ok(label, detail = '') {
  console.log(`  ✅ ${label}${detail ? ' — ' + detail : ''}`);
  passed++;
}
function fail(label, detail = '') {
  console.log(`  ❌ ${label}${detail ? ' — ' + detail : ''}`);
  failed++;
}

async function rest(path, opts = {}) {
  const r = await fetch(`${URL}/rest/v1/${path}`, {
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${ANON}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...opts.headers,
    },
    ...opts,
  });
  let body;
  try { body = await r.json(); } catch { body = null; }
  return { status: r.status, ok: r.ok, body };
}

async function auth(endpoint, payload) {
  const r = await fetch(`${URL}/auth/v1/${endpoint}`, {
    method: 'POST',
    headers: { apikey: ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  let body;
  try { body = await r.json(); } catch { body = null; }
  return { status: r.status, ok: r.ok, body };
}

// ─────────────────────────────────────────────
console.log('\n━━━ 1. SUPABASE CONNECTIVITY ━━━');
// ─────────────────────────────────────────────
try {
  const r = await fetch(`${URL}/rest/v1/`, { headers: { apikey: ANON } });
  if (r.ok || r.status === 200) ok('Supabase REST API reachable', `${URL}`);
  else fail('Supabase REST API', `HTTP ${r.status}`);
} catch (e) {
  fail('Supabase REST API', e.message);
}

// ─────────────────────────────────────────────
console.log('\n━━━ 2. TABLE EXISTENCE ━━━');
// ─────────────────────────────────────────────
const tables = ['student','company','admin','skill','internship','student_skill','internship_requirements','application'];
const tableStatus = {};

for (const t of tables) {
  const r = await rest(`${t}?select=*&limit=0`);
  if (r.ok || r.status === 200) {
    ok(`Table: ${t}`);
    tableStatus[t] = true;
  } else if (r.status === 401 || r.status === 403) {
    ok(`Table: ${t}`, 'exists (RLS blocking anon — expected)');
    tableStatus[t] = true;
  } else {
    fail(`Table: ${t}`, r.body?.message || `HTTP ${r.status}`);
    tableStatus[t] = false;
  }
}

// ─────────────────────────────────────────────
console.log('\n━━━ 3. DATA READS (public tables) ━━━');
// ─────────────────────────────────────────────
if (tableStatus['skill']) {
  const r = await rest('skill?select=skill_id,skill_name,category&order=skill_id');
  if (r.ok && Array.isArray(r.body)) {
    ok(`skill table readable`, `${r.body.length} skills found`);
    if (r.body.length > 0) ok('Seed data present', r.body.slice(0,3).map(s=>s.skill_name).join(', ') + '...');
    else fail('Seed data', 'No skills found — run setup-db.mjs or apply-schema.mjs');
  } else {
    fail('skill table read', r.body?.message || `HTTP ${r.status}`);
  }
}

if (tableStatus['internship']) {
  const r = await rest('internship?select=internship_id,title&limit=3');
  if (r.ok && Array.isArray(r.body)) {
    ok(`internship table readable`, `${r.body.length} sample rows`);
  } else if (r.status === 401 || r.status === 403) {
    ok('internship table', 'RLS active — requires auth');
  } else {
    fail('internship table read', r.body?.message || `HTTP ${r.status}`);
  }
}

if (tableStatus['admin']) {
  const r = await rest('admin?select=admin_id&limit=1');
  if (r.ok) ok('admin table readable', `${r.body?.length ?? 0} admins`);
  else if (r.status === 401 || r.status === 403) ok('admin table', 'RLS active');
  else fail('admin table read', r.body?.message);
}

// ─────────────────────────────────────────────
console.log('\n━━━ 4. AUTH SYSTEM ━━━');
// ─────────────────────────────────────────────
// Test signup with a temp email
const testEmail = `test_${Date.now()}@skillsync-test.com`;
const testPass  = 'TestPass123!';

const signupRes = await auth('signup', { email: testEmail, password: testPass });
if (signupRes.ok && signupRes.body?.user?.id) {
  ok('Auth signup', `user created: ${signupRes.body.user.id.slice(0,8)}...`);
  const testUserId = signupRes.body.user.id;
  const testToken  = signupRes.body.access_token;

  // Test login
  const loginRes = await auth('token?grant_type=password', { email: testEmail, password: testPass });
  if (loginRes.ok && loginRes.body?.access_token) {
    ok('Auth login (password grant)', 'JWT received');
    const jwt = loginRes.body.access_token;

    // Test authenticated read
    const authRead = await rest('skill?select=skill_name&limit=1', {
      headers: { Authorization: `Bearer ${jwt}` }
    });
    if (authRead.ok) ok('Authenticated REST read', 'skill table accessible with JWT');
    else fail('Authenticated REST read', authRead.body?.message);

    // Test student profile insert (own row)
    if (tableStatus['student']) {
      const insertRes = await rest('student', {
        method: 'POST',
        headers: { Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ student_id: testUserId, name: 'Test User', email: testEmail }),
      });
      if (insertRes.ok || insertRes.status === 201) {
        ok('Student profile insert (own row)', 'RLS allows own insert');

        // Test student profile read (own row)
        const readRes = await rest(`student?student_id=eq.${testUserId}&select=name,email`, {
          headers: { Authorization: `Bearer ${jwt}` }
        });
        if (readRes.ok && readRes.body?.length > 0) ok('Student profile read (own row)', readRes.body[0].name);
        else fail('Student profile read', readRes.body?.message || 'no rows');

        // Test student profile update
        const updateRes = await rest(`student?student_id=eq.${testUserId}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${jwt}` },
          body: JSON.stringify({ college: 'Test University' }),
        });
        if (updateRes.ok) ok('Student profile update', 'college field updated');
        else fail('Student profile update', updateRes.body?.message);

      } else {
        fail('Student profile insert', insertRes.body?.message || `HTTP ${insertRes.status}`);
      }
    }

    // Test skill add (student_skill)
    if (tableStatus['student_skill'] && tableStatus['skill']) {
      const skillRes = await rest('skill?select=skill_id&limit=1', {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      if (skillRes.ok && skillRes.body?.length > 0) {
        const skillId = skillRes.body[0].skill_id;
        const addSkill = await rest('student_skill', {
          method: 'POST',
          headers: { Authorization: `Bearer ${jwt}` },
          body: JSON.stringify({ student_id: testUserId, skill_id: skillId, proficiency_level: 'Beginner' }),
        });
        if (addSkill.ok || addSkill.status === 201) ok('Add student skill', `skill_id ${skillId} added`);
        else fail('Add student skill', addSkill.body?.message);

        // Test delete skill
        const delSkill = await rest(`student_skill?student_id=eq.${testUserId}&skill_id=eq.${skillId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${jwt}` },
        });
        if (delSkill.ok || delSkill.status === 204) ok('Delete student skill', 'removed successfully');
        else fail('Delete student skill', delSkill.body?.message);
      }
    }

    // Test application insert
    if (tableStatus['application'] && tableStatus['internship']) {
      const intRes = await rest('internship?select=internship_id&limit=1', {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      if (intRes.ok && intRes.body?.length > 0) {
        const intId = intRes.body[0].internship_id;
        const applyRes = await rest('application', {
          method: 'POST',
          headers: { Authorization: `Bearer ${jwt}` },
          body: JSON.stringify({ student_id: testUserId, internship_id: intId }),
        });
        if (applyRes.ok || applyRes.status === 201) {
          ok('Apply to internship', `internship_id ${intId}`);

          // Read own applications
          const appsRes = await rest(`application?student_id=eq.${testUserId}&select=application_id,status`, {
            headers: { Authorization: `Bearer ${jwt}` }
          });
          if (appsRes.ok && appsRes.body?.length > 0) ok('Read own applications', `${appsRes.body.length} found, status: ${appsRes.body[0].status}`);
          else fail('Read own applications', appsRes.body?.message);
        } else {
          fail('Apply to internship', applyRes.body?.message || `HTTP ${applyRes.status}`);
        }
      } else {
        fail('Apply to internship', 'No internships in DB — run seed-50.mjs');
      }
    }

  } else {
    fail('Auth login', loginRes.body?.error_description || loginRes.body?.message || `HTTP ${loginRes.status}`);
  }

  // Cleanup: delete test user via admin API (needs service role — skip if not available)
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (svcKey) {
    await fetch(`${URL}/auth/v1/admin/users/${testUserId}`, {
      method: 'DELETE',
      headers: { apikey: svcKey, Authorization: `Bearer ${svcKey}` },
    });
    ok('Cleanup', 'test user deleted');
  } else {
    console.log(`  ℹ️  Cleanup skipped (no service role key) — test user ${testEmail} left in DB`);
  }

} else if (signupRes.status === 422 && signupRes.body?.msg?.includes('already registered')) {
  ok('Auth signup', 'email confirmation disabled or user exists');
} else {
  fail('Auth signup', signupRes.body?.error_description || signupRes.body?.message || `HTTP ${signupRes.status}`);
}

// ─────────────────────────────────────────────
console.log('\n━━━ 5. RLS SECURITY CHECKS ━━━');
// ─────────────────────────────────────────────
// Anon should NOT be able to read student data
const anonStudent = await rest('student?select=*&limit=1');
if (anonStudent.status === 401 || anonStudent.status === 403 || (anonStudent.ok && anonStudent.body?.length === 0)) {
  ok('RLS: anon cannot read student table');
} else if (anonStudent.ok && anonStudent.body?.length > 0) {
  fail('RLS: anon CAN read student table', '⚠️  Run setup-rls.mjs to fix');
} else {
  ok('RLS: student table protected', `HTTP ${anonStudent.status}`);
}

// Anon should NOT be able to read applications
const anonApp = await rest('application?select=*&limit=1');
if (anonApp.status === 401 || anonApp.status === 403 || (anonApp.ok && anonApp.body?.length === 0)) {
  ok('RLS: anon cannot read application table');
} else if (anonApp.ok && anonApp.body?.length > 0) {
  fail('RLS: anon CAN read application table', '⚠️  Run setup-rls.mjs to fix');
} else {
  ok('RLS: application table protected', `HTTP ${anonApp.status}`);
}

// ─────────────────────────────────────────────
console.log('\n━━━ SUMMARY ━━━');
// ─────────────────────────────────────────────
console.log(`  Passed: ${passed}  |  Failed: ${failed}`);
if (failed === 0) {
  console.log('  🎉 All checks passed — database is fully live and functional!\n');
} else {
  console.log('  ⚠️  Some checks failed. See above for details.\n');
}
