import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ success: false, error: 'Company ID is required' }, { status: 400 });
    }

    // Fetch company internships with application counts and requirements
    const { data: internships, error } = await supabase
      .from('internship')
      .select(`
        *,
        application(status),
        internship_requirements(skill(skill_id, skill_name))
      `)
      .eq('company_id', companyId)
      .order('internship_id', { ascending: false });

    if (error) throw error;

    const enriched = (internships || []).map((job: any) => ({
      ...job,
      id: job.internship_id.toString(),
      application: job.application || [],
      requirements: {
          role_skills: job.internship_requirements?.map((ir: any) => ir.skill.skill_name) || []
      }
    }));

    return NextResponse.json({ success: true, data: enriched });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company_id, title, description, duration, location, stipend, skills } = body;

    if (!company_id || !title) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Insert Internship (internship_id is SERIAL)
    const { data: internship, error: internError } = await supabase
      .from('internship')
      .insert({
        company_id,
        title,
        description,
        duration,
        location,
        stipend
      } as any)
      .select()
      .single();

    if (internError) throw internError;

    // 2. Insert Skills into internship_requirements junction table
    if (skills && skills.length > 0) {
      // Find skill IDs for the provided skill names
      const { data: skillItems } = await supabase
        .from('skill')
        .select('skill_id, skill_name')
        .in('skill_name', skills);

      if (skillItems && skillItems.length > 0) {
        const requirements = skillItems.map(s => ({
          internship_id: internship.internship_id,
          skill_id: s.skill_id
        }));

        await supabase.from('internship_requirements').insert(requirements);
      }
    }

    return NextResponse.json({ success: true, data: internship });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    // Delete from internship table (Cascades to applications and requirements)
    const { error } = await supabase
      .from('internship')
      .delete()
      .eq('internship_id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
