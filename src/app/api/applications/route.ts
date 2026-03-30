import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { AI_ENGINE } from '@/lib/ai-engine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    // Fetch applications with internship and company details
    const { data: applications, error } = await supabase
      .from('application')
      .select(`
        *,
        internship(
          title,
          duration,
          stipend,
          location,
          company(company_name)
        )
      `)
      .eq('student_id', userId)
      .order('applied_date', { ascending: false });

    if (error) throw error;

    const enrichedApps = (applications || []).map((app: any) => ({
      application_id: app.application_id.toString(),
      applied_date: app.applied_date,
      status: app.status,
      internship: app.internship ? {
        title: app.internship.title,
        duration: app.internship.duration,
        stipend: app.internship.stipend,
        location: app.internship.location,
        company: app.internship.company ? { company_name: app.internship.company.company_name } : null
      } : null
    }));

    return NextResponse.json({ success: true, data: enrichedApps });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, internshipId } = body;

    if (!userId || !internshipId) {
      return NextResponse.json({ success: false, error: 'User ID and Internship ID are required' }, { status: 400 });
    }

    // 1. Verify existence and check for existing application
    const { data: existing } = await supabase
      .from('application')
      .select('application_id')
      .eq('student_id', userId)
      .eq('internship_id', internshipId)
      .single();

    if (existing) {
      return NextResponse.json({ success: false, error: 'You have already applied for this internship' }, { status: 400 });
    }

    // 2. Fetch Student Skills and Internship Requirements for AI
    const [studentRes, internshipRes] = await Promise.all([
      supabase.from('student_skill').select('skill(skill_name)').eq('student_id', userId),
      supabase.from('internship_requirements').select('skill(skill_name)').eq('internship_id', internshipId),
    ]);

    const { data: internshipData } = await supabase
      .from('internship')
      .select('title')
      .eq('internship_id', internshipId)
      .single();

    if (studentRes.error || internshipRes.error || !internshipData) {
      return NextResponse.json({ success: false, error: 'Context for AI matching not found' }, { status: 404 });
    }

    const studentSkills = (studentRes.data || []).map((s: any) => s.skill.skill_name);
    const requiredSkills = (internshipRes.data || []).map((r: any) => r.skill.skill_name);
    
    const matchScore = AI_ENGINE.calculateMatchScore(studentSkills, requiredSkills);
    const interviewQuestions = AI_ENGINE.generateInterviewQuestions(studentSkills, internshipData.title);

    // 3. Create Application (application_id is SERIAL)
    const { data: newApp, error: insertError } = await supabase
      .from('application')
      .insert({
        student_id: userId,
        internship_id: internshipId,
        status: 'Pending',
        ai_match_score: matchScore,
        ai_interview_questions: interviewQuestions
      } as any)
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ 
      success: true, 
      data: newApp
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('applicationId');

    if (!appId) {
      return NextResponse.json({ success: false, error: 'Application ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('application')
      .delete()
      .eq('application_id', appId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
