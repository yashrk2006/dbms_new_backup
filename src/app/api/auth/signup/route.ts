import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, password, name, type } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Sign up the user with Supabase Auth
    // Note: In production, you'd handle email confirmation. 
    // For this DBMS project demo, we assume auto-confirm or manual confirmed via dashboard.
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: type || 'student'
        }
      }
    });

    if (authError) throw authError;

    const user = authData.user;
    if (!user) throw new Error('Failed to create user');

    // 2. Insert into the relevant profile table
    if (type === 'company') {
      const { error: profileError } = await supabaseAdmin // Use admin to bypass RLS for initial creation
        .from('company')
        .insert({
          company_id: user.id,
          company_name: name,
          email,
          industry: 'Technology',
          location: 'Remote'
        } as any);

      if (profileError) throw profileError;

      return NextResponse.json({ success: true, user: { id: user.id, name, email }, type: 'company' });
    } else {
      const { error: profileError } = await supabaseAdmin
        .from('student')
        .insert({
          student_id: user.id,
          name,
          email,
          college: 'Global Institute of Technology',
          branch: 'Computer Science',
          graduation_year: new Date().getFullYear() + 2
        } as any);

      if (profileError) throw profileError;

      return NextResponse.json({ success: true, user: { id: user.id, name, email }, type: 'student' });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
