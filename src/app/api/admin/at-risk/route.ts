import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // 1. Fetch all students
    const { data: students, error: studentError } = await supabase
      .from('student')
      .select(`
        student_id,
        name,
        email,
        college,
        application(status, ai_match_score)
      `);

    if (studentError) throw studentError;

    // 2. Compute "At-Risk" logic
    // Criteria: 
    // - No applications
    // - OR Avg Match Score < 30%
    // - OR All applications rejected
    const atRisk = (students || []).filter((s: any) => {
      const apps = s.application || [];
      if (apps.length === 0) return true;
      
      const avgScore = apps.reduce((acc: number, curr: any) => acc + (curr.ai_match_score || 0), 0) / apps.length;
      if (avgScore < 40) return true;

      const allRejected = apps.every((a: any) => a.status === 'Rejected');
      if (allRejected) return true;

      return false;
    }).map((s: any) => ({
      student_id: s.student_id,
      name: s.name,
      college: s.college,
      reason: s.application.length === 0 ? "No career engagement detected." : s.application.every((a: any) => a.status === 'Rejected') ? "High friction in recruitment funnel." : "Low AI match parity."
    }));

    return NextResponse.json({ success: true, count: atRisk.length, data: atRisk });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
