import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      const roleIntent = cookieStore.get('auth_role_intent')?.value || 'student';
      
      // Critical Security: Admin Whitelist Gate
      if (roleIntent === 'admin') {
        const { isAuthorizedAdmin } = await import('@/lib/admin-whitelist');
        if (!isAuthorizedAdmin(user?.email)) {
             console.error('Non-whitelisted user attempted Admin synthesize:', user?.email);
             return NextResponse.redirect(`${origin}/auth/login?error=UnauthorizedAdmin`);
        }
      }

      // Cleanup auth cookies and proceed
      cookieStore.delete('auth_role_intent');
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error('Auth Code Exchange Error:', error.message);
  } else {
    console.warn('Auth Callback: No code provided in search params.');
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
