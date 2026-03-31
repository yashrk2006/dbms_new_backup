import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { NotificationService } from '@/lib/notifications';

/**
 * OTP Dispatch Service
 * Generates and sends a 6-digit verification code to the provided email.
 * This file is .tsx to support React email templates.
 */
export async function POST(request: Request) {
  try {
    const { roll_no, email } = await request.json();

    if (!roll_no || !email) {
      return NextResponse.json({ error: 'Roll Number and email required' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min expiration

    // Store OTP in database log for verification step
    const { error: dbError } = await supabaseAdmin
      .from('otp_logs')
      .insert([{
        email,
        roll_no,
        otp_code: otp,
        expires_at: expiresAt,
        is_verified: false
      }]);

    if (dbError) {
      console.error('❌ OTP Log Error:', dbError);
      return NextResponse.json({ error: 'Failed to generate verification session' }, { status: 500 });
    }

    // Dispatch OTP via Resend
    const { success, error: emailError } = await NotificationService.sendEmail({
      to: email,
      subject: `SkillSync: ${otp} is your verification code`,
      react: (
        <div style={{ backgroundColor: '#0f172a', padding: '40px', color: '#fff', borderRadius: '16px', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#ea580c' }}>Institutional Verification</h2>
          <p>Hi, someone (hopefully you!) is attempting to link your institutional identity [${roll_no}] to SkillSync.</p>
          <div style={{ padding: '24px', backgroundColor: 'rgba(255,255,255,0.05)', fontSize: '32px', fontWeight: 'bold', textAlign: 'center', letterSpacing: '8px', margin: '24px 0' }}>
            {otp}
          </div>
          <p>This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
      )
    });

    if (!success) {
      console.error('❌ OTP Dispatch Error:', emailError);
      return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });

  } catch (error) {
    console.error('❌ Server Crash:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
