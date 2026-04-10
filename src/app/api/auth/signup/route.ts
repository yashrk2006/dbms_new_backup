import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getFriendlyErrorMessage } from '@/lib/error-adapter';

export async function POST(request: Request) {
  try {
    const { email, password, name, type } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ success: false, error: 'All institutional identity fields (Name, Email, Password) are required.' }, { status: 400 });
    }

    // 1. Sign up the user with Supabase Auth
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

    if (authError) {
      console.error('❌ Auth Creation Error:', authError.message);
      return NextResponse.json({ success: false, error: getFriendlyErrorMessage(authError) }, { status: 500 });
    }

    const user = authData.user;
    if (!user) throw new Error('Failed to synchronize institutional identity.');

    // 2. Profile insertion is now handled via DB Trigger: on_auth_user_created
    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, name, email }, 
      type: type || 'student',
      message: 'Institutional identity created. Redirecting for synchronization.'
    });

  } catch (error: unknown) {
    console.error('❌ Registration Sync Failure:', error);
    return NextResponse.json({ success: false, error: getFriendlyErrorMessage(error) }, { status: 500 });
  }
}
