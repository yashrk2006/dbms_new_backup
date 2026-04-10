// Native fetch is available in Node 18+

async function verify() {
  console.log('--- VERIFYING ADMIN STATS ---');
  try {
    const res = await fetch('http://localhost:3000/api/admin/stats');
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Total Students (including directory):', data.data?.stats?.students);
    console.log('Total Companies:', data.data?.stats?.companies);
    console.log('Recent Activity Count:', data.data?.recentActivity?.length);
    
    console.log('\n--- VERIFYING STUDENT PROFILE (Sample) ---');
    const profileRes = await fetch('http://localhost:3000/api/students/profile?userId=dummy_test_id');
    const profileData = await profileRes.json();
    console.log('Profile Load Success:', profileData.success);
    if (profileData.data?.profile) {
      console.log('Roll No in Profile:', profileData.data.profile.roll_no);
    }
  } catch (err) {
    console.error('Verification failed:', err.message);
  }
}

verify();
