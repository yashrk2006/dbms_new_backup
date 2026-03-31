import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { AI_ENGINE } from '@/lib/ai-engine';
import { NotificationService } from '@/lib/notifications';

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

    // 2. Fetch Student Skills and Internship/Company Details for AI and Notifications
    const [studentRes, internshipRes, studentDataRes] = await Promise.all([
      supabase.from('student_skill').select('skill(skill_name)').eq('student_id', userId),
      supabase.from('internship_requirements').select('skill(skill_name)').eq('internship_id', internshipId),
      supabase.from('student').select('name, email').eq('student_id', userId).single(),
    ]);

    const { data: internshipData } = await supabase
      .from('internship')
      .select(`
        title,
        company(company_name, email)
      `)
      .eq('internship_id', internshipId)
      .single();

    if (studentRes.error || internshipRes.error || !internshipData || studentDataRes.error) {
      return NextResponse.json({ success: false, error: 'Context for AI matching or notifications not found' }, { status: 404 });
    }

    const studentSkills = (studentRes.data || []).map((s: any) => s.skill.skill_name);
    const requiredSkills = (internshipRes.data || []).map((r: any) => r.skill.skill_name);
    
    const matchScore = AI_ENGINE.calculateMatchScore(studentSkills, requiredSkills);
    const interviewQuestions = AI_ENGINE.generateInterviewQuestions(studentSkills, internshipData.title);

    // 3. Create Application
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

    // 4. Trigger Notifications (Async/Non-blocking preferred, but we'll await for safety in demo)
    try {
      const student = studentDataRes.data;
      const company = (internshipData as any).company;

      await Promise.all([
        NotificationService.notifyApplicationReceived(student.email, student.name, internshipData.title),
        NotificationService.notifyCompanyNewApplicant(company.email, student.name, internshipData.title)
      ]);
    } catch (notifyError) {
      console.warn('⚠️ Notification failed, but application succeeded:', notifyError);
    }

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
