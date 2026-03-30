import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: companies, error } = await supabase
      .from('company')
      .select('*')
      .order('company_name', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, data: companies });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
