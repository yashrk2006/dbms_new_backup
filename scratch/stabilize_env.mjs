import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SK = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL_BASE || !SK) {
    console.error('❌ Missing credentials in .env.local');
    process.exit(1);
}

const headers = {
    'Content-Type': 'application/json',
    'apikey': SK,
    'Authorization': `Bearer ${SK}`,
};

async function rest(method, path, body) {
    const res = await fetch(`${URL_BASE}${path}`, {
        method,
        headers: { ...headers, 'Prefer': 'return=representation,resolution=merge-duplicates' },
        body: body ? JSON.stringify(body) : undefined,
    });
    let data;
    try {
        data = await res.json();
    } catch {
        data = null;
    }
    if (res.status >= 400) {
        console.error(`❌ Error ${method} ${path}:`, data);
    }
    return data;
}

async function adminAuth(method, path, body) {
    const res = await fetch(`${URL_BASE}/auth/v1${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
    return res.json();
}

async function ensureUser(email, id, role) {
    console.log(`🔐 Ensuring user: ${email}`);
    
    // Try to create first
    const res = await adminAuth('POST', '/admin/users', {
        id: id,
        email,
        password: 'password123',
        email_confirm: true,
        user_metadata: { role }
    });

    if (res && res.id) {
        console.log(`   ✔ Created user: ${res.id}`);
        return res.id;
    } 
    
    // If exists, find it
    if (res.error_code === 'email_exists' || res.msg?.includes('already been registered')) {
        console.log(`   ⚠ User exists, fetching...`);
        // List with large page size to ensure we find it
        const listRes = await adminAuth('GET', '/admin/users?per_page=100');
        const existing = listRes?.users?.find(u => u.email === email);
        if (existing) {
            console.log(`   ✔ Found existing user: ${existing.id}`);
            return existing.id;
        }
    }

    console.error(`   ❌ Failed to ensure user ${email}:`, res);
    return null;
}

async function main() {
    console.log('🚀 Finalizing Environment Stabilization...\n');

    // 1. Ensure Auth Users
    const studentId = await ensureUser('demo@student.com', '00000000-0000-0000-0000-000000000000', 'student');
    const adminId = await ensureUser('admin@skillsync.com', '6b111642-d819-452e-8979-81215d475127', 'admin');
    const companyId = await ensureUser('tech@innovate.com', '11111111-1111-1111-1111-111111111111', 'company');

    if (!studentId || !adminId || !companyId) {
        console.error('❌ Could not ensure all users. Aborting sync.');
        // Don't exit 1 if some were found, but here we need all for this demo
        process.exit(1);
    }

    // 2. Link Profiles
    console.log('\n📊 Linking Profiles...');
    
    await rest('POST', '/rest/v1/student', {
        student_id: studentId,
        name: 'SkillSync User',
        email: 'demo@student.com',
        college: 'SkillSync Institute',
        branch: 'Computer Science',
        graduation_year: 2025,
        market_reach: 85
    });

    await rest('POST', '/rest/v1/admin', {
        admin_id: adminId,
        email: 'admin@skillsync.com',
        role: 'admin'
    });

    await rest('POST', '/rest/v1/company', {
        company_id: companyId,
        company_name: 'InnovateTech',
        email: 'tech@innovate.com',
        industry: 'AI Research',
        location: 'Metaverse',
        is_verified: true
    });

    // 3. Seed Internships
    console.log('💼 Seeding Internships...');
    const internRes = await rest('POST', '/rest/v1/internship', {
        company_id: companyId,
        title: 'Neural Sync Intern',
        description: 'Deep dive into SkillSync architecture.',
        duration: '6 Months',
        stipend: '₹50,000',
        location: 'Remote',
        internship_type: 'Remote',
        openings: 5
    });
    
    const internId = Array.isArray(internRes) ? internRes[0]?.internship_id : (internRes?.internship_id || null);

    // 4. Seed Applications for Student
    if (internId) {
        console.log('📝 Seeding Applications...');
        await rest('POST', '/rest/v1/application', {
            student_id: studentId,
            internship_id: internId,
            status: 'Under Review',
            ai_match_score: 94
        });
    }

    // 5. Seed Events
    console.log('📅 Seeding Events...');
    await rest('POST', '/rest/v1/event', {
        user_id: adminId,
        title: 'System Stability Review',
        event_type: 'Technical',
        start_time: new Date(Date.now() + 86400000).toISOString(),
        description: 'Post-stabilization validation session.'
    });

    console.log('\n✅ Environment Stabilized Successfully!');
}

main().catch(console.error);
