import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ success: false, error: 'Company ID is required' }, { status: 400 });
    }

    const { data: company, error } = await supabase
      .from('company')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (error || !company) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      company: {
        id: company.company_id,
        name: company.company_name,
        email: company.email,
        description: company.description || '',
        industry: company.industry,
        website: company.website || '',
        location: company.location
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyId, profile } = body;

    if (!companyId || !profile) {
      return NextResponse.json({ success: false, error: 'Company ID and profile are required' }, { status: 400 });
    }

    const { data: updated, error } = await supabase
      .from('company')
      .update({
        company_name: profile.name,
        industry: profile.industry,
        description: profile.description,
        website: profile.website,
        location: profile.location
      } as any)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) throw error;
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
