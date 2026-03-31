import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import pg from 'pg';

/**
 * OTP Verification Service (Permanent Access Version)
 * Validates code, bridges identity via Direct SQL, and injects Required Metadata for Dashboard access.
 * Returns a secure temp password for synchronous Client-Side Handshake.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const roll_no = body.roll_no?.trim();
    const email = body.email?.trim().toLowerCase();
    const otp = body.otp?.trim();

    if (!roll_no || !email || !otp) {
      return NextResponse.json({ error: 'Roll Number, email, and OTP required' }, { status: 400 });
    }

    console.log('🔍 Attempting Verification [Permanent Access Handshake]:', { roll_no, email, otp });

    // 1. Verify OTP Status (6hr drift buffer)
    const driftBuffer = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

    const { data: otpRecord, error: otpError } = await supabaseAdmin
      .from('otp_logs')
      .select('*')
      .eq('roll_no', roll_no)
      .eq('email', email)
      .eq('otp_code', otp)
      .eq('is_verified', false)
      .gt('expires_at', driftBuffer)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError || !otpRecord) {
      console.warn('❌ OTP Verification Failed Details:', { found: !!otpRecord, roll_no, email, otp });
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 401 });
    }

    // 2. Fetch Institutional Batch Data
    const { data: directoryData, error: dirError } = await supabaseAdmin
      .from('college_directory')
      .select('*')
      .eq('roll_no', roll_no)
      .limit(1)
      .maybeSingle();

    if (dirError || !directoryData) {
      console.error('❌ Directory Lookup Error:', dirError?.message);
      return NextResponse.json({ error: 'Failed to synchronize institutional data' }, { status: 500 });
    }

    // 3. DIRECT SQL IDENTITY DISCOVERY
    const pgClient = new pg.Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    let authUser: any = null;
    try {
      await pgClient.connect();
      const { rows } = await pgClient.query('SELECT id, email FROM auth.users WHERE email = $1', [email]);
      if (rows.length > 0) {
        authUser = { id: rows[0].id, email: rows[0].email };
        console.log('✅ Identity Discovered via Postgres Bypass:', authUser.id);
      }
    } catch (pgErr: any) {
      console.error('❌ Direct SQL Bypass Failed:', pgErr.message);
    } finally {
      await pgClient.end();
    }

    // 4. IDENTITY HARDENING & PASS-HANDSHAKE
    // We generate a secure temporary password that the client will use for this session
    const syncPassword = Math.random().toString(36).slice(-20) + 'Aa1!';
    
    if (!authUser) {
      // Create new user with forced metadata
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: syncPassword,
        email_confirm: true,
        user_metadata: { role: directoryData.role, roll_no: directoryData.roll_no }
      });

      if (createError) {
        console.error('❌ Auth Creation Error:', createError);
        return NextResponse.json({ error: 'Failed to create secure identity' }, { status: 500 });
      }
      authUser = newUser.user;
    } else {
      // UPGRADE EXISTING USER: Inject role/roll_no and set sync password
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
        password: syncPassword,
        user_metadata: { 
          role: directoryData.role || 'student', 
          roll_no: directoryData.roll_no 
        }
      });

      if (updateError) {
        console.error('❌ Identity Hardening Error:', updateError.message);
        return NextResponse.json({ error: 'Failed to authorize institutional role' }, { status: 500 });
      }
    }

    // 5. Institutional Profile Synchronization (Postgres Table)
    if (directoryData.role === 'student' && authUser) {
      try {
        await supabaseAdmin
          .from('student')
          .upsert({
            student_id: authUser.id,
            name: directoryData.name,
            email: email,
            college: 'Institutional Batch 2024',
            branch: directoryData.branch || directoryData.course,
            graduation_year: directoryData.batch_year + 4, 
          });
      } catch (syncErr: any) {
        console.error('❌ Profile Sync Crash (Non-Blocking):', syncErr.message);
      }
    }

    // 6. FINALLY Mark OTP as verified
    await supabaseAdmin
      .from('otp_logs')
      .update({ is_verified: true })
      .eq('id', otpRecord.id);

    return NextResponse.json({
      success: true,
      message: 'Permanent Institutional access authorized.',
      email: email,
      sync_password: syncPassword // The temporary secure key for this session
    });

  } catch (error: any) {
    console.error('❌ Verification Crash:', error.message || error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
