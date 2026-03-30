import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: studentsRaw, error } = await supabase
      .from('student')
      .select('student_id, name, email, college, branch, graduation_year, student_skill(skill(skill_name))')
      .order('name', { ascending: true });

    if (error) throw error;

    const enriched = (studentsRaw || []).map((s: any) => ({
      student_id: s.student_id,
      name: s.name,
      email: s.email,
      college: s.college,
      branch: s.branch || 'N/A',
      academic_year: s.graduation_year || 'N/A',
      student_skill: s.student_skill?.map((sk: any) => ({
          skill_name: sk.skill.skill_name
      })) || []
    }));

    return NextResponse.json({ success: true, data: enriched });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
