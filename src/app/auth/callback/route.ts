import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // fallback "next" to dashboard if not provided
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
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (!error) {
        const { data: { user } } = await supabase.auth.getUser();
        const roleIntent = cookieStore.get('auth_role_intent')?.value || 'student';
        
        // Critical Security: Admin Whitelist Gate
        if (roleIntent === 'admin') {
          const { isAuthorizedAdmin } = await import('@/lib/admin-whitelist');
          if (!isAuthorizedAdmin(user?.email)) {
               console.error('Unauthorized Admin access attempt:', user?.email);
               return NextResponse.redirect(`${origin}/auth/login?error=UnauthorizedAdmin`);
          }
        }

        // Cleanup role intent cookie
        cookieStore.delete('auth_role_intent');

        // If going to complete-profile, append the role intent as a query param
        // to ensure it persists if the user refresh the page or cookie is missing
        if (next === '/auth/complete-profile') {
          return NextResponse.redirect(`${origin}${next}?role=${roleIntent}`);
        }

        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch (err) {
      console.error('Fatal Auth Callback Error:', err);
    }
  }

  // Fallback to error page
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}

