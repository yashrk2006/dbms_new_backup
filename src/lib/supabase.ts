import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client for client-side interactions
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

/**
 * For administrative tasks (bypassing RLS).
 * Only use this in server-side contexts where security is handled.
 */
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
);


