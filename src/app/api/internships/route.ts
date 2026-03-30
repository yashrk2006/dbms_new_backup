import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // 1. Fetch Internships with Company and Requirements
    const { data: internships, error } = await supabase
      .from('internship')
      .select(`
        *,
        company(company_name),
        internship_requirements(skill(skill_name))
      `);

    if (error) throw error;

    // 2. Fetch User's Applications (to mark as applied)
    let appliedIds: Set<number> = new Set();
    if (userId) {
      const { data: userApps } = await supabase
        .from('application')
        .select('internship_id')
        .eq('student_id', userId);
      
      if (userApps) {
        appliedIds = new Set(userApps.map(a => a.internship_id));
      }
    }

    // 3. Enrich and Format
    const enriched = (internships || []).map((i: any) => ({
      ...i,
      id: i.internship_id.toString(),
      company_name: i.company?.company_name || 'Independent',
      requirements: {
          role_skills: i.internship_requirements?.map((ir: any) => ir.skill.skill_name) || []
      },
      applied: appliedIds.has(i.internship_id)
    }));

    return NextResponse.json({ success: true, data: enriched });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
