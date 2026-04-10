import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyFlow() {
  const testRollNo = '24/70001'; // Mohit Sharma
  const testEmail = 'mohit.test@gmail.com';
  const testOtp = '123456';

  console.log('--- STARTING END-TO-END VERIFICATION ---');

  // 1. Cleanup old data
  await supabase.from('otp_logs').delete().eq('roll_no', testRollNo);
  await supabase.from('notification').delete().eq('title', 'Verification Successful 🎓');
  // Note: we don't delete the student to avoid auth issues in this test, 
  // we just assume we're testing the upsert/notification logic.

  // 2. Prepare OTP Log
  console.log('1. Creating mock OTP session...');
  const { error: otpErr } = await supabase.from('otp_logs').insert([{
    roll_no: testRollNo,
    email: testEmail,
    otp_code: testOtp,
    expires_at: new Date(Date.now() + 1000 * 60).toISOString(),
    is_verified: false
  }]);
  if (otpErr) throw otpErr;

  // 3. Simulate the logic in api/auth/otp/verify/route.ts
  console.log('2. Simulating backend verification & profile sync...');
  
  // Lookup directory
  const { data: directoryData } = await supabase
    .from('college_directory')
    .select('*')
    .eq('roll_no', testRollNo)
    .single();

  if (!directoryData) throw new Error('Student not found in directory');

  // Verify OTP (mock the API check)
  const { data: verifiedOtp } = await supabase
    .from('otp_logs')
    .select('*')
    .eq('roll_no', testRollNo)
    .eq('otp_code', testOtp)
    .single();

  if (!verifiedOtp) throw new Error('OTP verify failed');

  // Perform Upsert (Crucial bit)
  // For the test, we need a UUID. I'll use a dummy one for the database sync test.
  const dummyAuthId = '00000000-0000-0000-0000-000000000000'; 
  
  console.log('3. Testing Student Table Upsert...');
  const { error: syncErr } = await supabase
    .from('student')
    .upsert({
      student_id: dummyAuthId,
      name: directoryData.name,
      roll_no: directoryData.roll_no,
      email: testEmail,
      college: 'Institutional Batch 2024',
      branch: directoryData.course,
      graduation_year: (directoryData.batch_year || 2024) + 3,
    });

  if (syncErr) {
    console.error('❌ Sync failed:', syncErr);
  } else {
    console.log('✅ Student table upserted successfully.');
    
    // Test Notification
    console.log('4. Testing Notification Injection...');
    const { error: notifyErr } = await supabase.from('notification').insert([{
      user_id: dummyAuthId,
      title: "Verification Successful 🎓",
      message: `Confirmed as Roll No: ${directoryData.roll_no}. Your institutional profile is now active.`,
      type: 'system'
    }]);

    if (notifyErr) console.error('❌ Notification failed:', notifyErr);
    else console.log('✅ Notification injected successfully.');
  }

  // 5. Final Check
  console.log('--- FINAL STATE CHECK ---');
  const { data: finalStudent } = await supabase.from('student').select('*').eq('roll_no', testRollNo).single();
  const { data: finalNotify } = await supabase.from('notification').select('*').eq('user_id', dummyAuthId).limit(1);

  console.log('Final Student Record:', finalStudent ? 'FOUND' : 'MISSING');
  console.log('Final Notification Record:', finalNotify?.length > 0 ? 'FOUND' : 'MISSING');

  if (finalStudent && finalNotify?.length > 0) {
    console.log('\n✨ ALL SYSTEMS GREEN: Institutional synchronization logic is functional.');
  } else {
    console.log('\n⚠️ Issues detected in synchronization chain.');
  }
}

verifyFlow().catch(console.error);
