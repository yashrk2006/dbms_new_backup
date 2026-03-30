import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { AI_ENGINE } from '@/lib/ai-engine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');

    if (!companyId) {
      return NextResponse.json({ success: false, error: 'Company ID required' }, { status: 400 });
    }

    // 1. Fetch Company Internships (to filter applications)
    const { data: internships } = await supabase
      .from('internship')
      .select('internship_id, title, internship_requirements(skill(skill_name))')
      .eq('company_id', companyId);

    const internIds = (internships || []).map(i => i.internship_id);

    // 2. Fetch Applications for those internships
    const { data: applications, error } = await supabase
      .from('application')
      .select(`
        *,
        student(
          student_id, name, email, college, branch, graduation_year,
          student_skill(skill(skill_name))
        ),
        internship(internship_id, title)
      `)
      .in('internship_id', internIds)
      .order('applied_date', { ascending: false });

    if (error) throw error;

    // 3. Enrich with AI matching logic
    const enriched = (applications || []).map((app: any) => {
      const studentSkills = app.student?.student_skill?.map((sk: any) => sk.skill.skill_name) || [];
      const role = internships?.find(i => i.internship_id === app.internship_id);
      const requiredSkills = role?.internship_requirements?.map((ir: any) => ir.skill.skill_name) || [];

      const matchScore = AI_ENGINE.calculateMatchScore(studentSkills, requiredSkills);
      const aiInterviewQuestions = (app.student && role) ? AI_ENGINE.generateInterviewQuestions(studentSkills, role.title) : [];

      return {
        ...app,
        application_id: app.application_id.toString(),
        match_score: matchScore,
        ai_interview_questions: aiInterviewQuestions,
        student: app.student ? {
          name: app.student.name,
          email: app.student.email,
          college: app.student.college,
          branch: app.student.branch,
          graduation_year: app.student.graduation_year || '2025',
          skills: app.student.student_skill?.map((sk: any) => ({
            skill_name: sk.skill.skill_name
          }))
        } : null,
        internship: app.internship ? {
            title: app.internship.title,
            company_id: companyId
        } : null
      };
    });

    return NextResponse.json({ success: true, data: enriched });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { applicationId, status } = await request.json();

    if (!applicationId || !status) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const { data: updated, error } = await supabase
      .from('application')
      .update({ status } as any)
      .eq('application_id', applicationId)
      .select()
      .single();

    if (error) throw error;
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
