import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: companies, error } = await supabaseAdmin
      .from('company')
      .select('company_name, email, industry, location, is_verified')
      .order('company_name', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, companies });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
