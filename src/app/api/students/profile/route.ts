import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const [studentRes, appCountRes, skillsCountRes] = await Promise.all([
      supabase.from('student').select('*').eq('student_id', userId).single(),
      supabase.from('application').select('*', { count: 'exact', head: true }).eq('student_id', userId),
      supabase.from('student_skill').select('*', { count: 'exact', head: true }).eq('student_id', userId)
    ]);

    if (studentRes.error || !studentRes.data) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          name: studentRes.data.name,
          college: studentRes.data.college,
          branch: studentRes.data.branch,
          graduation_year: studentRes.data.graduation_year,
          resume_url: studentRes.data.resume_url,
          email: studentRes.data.email
        },
        stats: {
          skills: skillsCountRes.count || 0,
          applications: appCountRes.count || 0
        }
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, profile } = await request.json();

    if (!userId || !profile) {
       return NextResponse.json({ success: false, error: 'Missing data' }, { status: 400 });
    }

    const { data: updated, error } = await supabase
      .from('student')
      .update({
        name: profile.name,
        college: profile.college,
        branch: profile.branch,
        graduation_year: profile.graduation_year ? parseInt(profile.graduation_year) : null,
        resume_url: profile.resume_url || null
      } as any)
      .eq('student_id', userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
