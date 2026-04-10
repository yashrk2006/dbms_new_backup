import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { AI_ENGINE } from '@/lib/ai-engine';
import { notifyApplicationReceived, notifyCompanyNewApplicant } from '@/lib/notifications';
import { getFriendlyErrorMessage } from '@/lib/error-adapter';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Identity ID is required for application retrieval.' }, { status: 400 });
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

    if (error) {
      console.error('❌ Application Retrieval Error:', error.message);
      return NextResponse.json({ success: false, error: getFriendlyErrorMessage(error) }, { status: 500 });
    }

    const enrichedApps = (applications || []).map((app: any) => ({
      application_id: app.application_id.toString(),
      applied_date: app.applied_date,
      status: app.status,
      ai_match_score: app.ai_match_score || 0,
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
    console.error('❌ Application GET Crash:', error);
    return NextResponse.json({ success: false, error: getFriendlyErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { student_id, internship_id } = body;

    if (!student_id || !internship_id) {
      return NextResponse.json({ success: false, error: 'Student Identity and Internship Reference are required.' }, { status: 400 });
    }

    // 1. Verify existence and check for existing application
    const { data: existing } = await supabase
      .from('application')
      .select('application_id')
      .eq('student_id', student_id)
      .eq('internship_id', internship_id)
      .single();

    if (existing) {
      return NextResponse.json({ success: false, error: 'An application entry is already active for this recruitment cycle.' }, { status: 400 });
    }

    // 2. Context Retrieval for AI Intelligence Layer
    const [studentRes, internshipRes, studentDataRes] = await Promise.all([
      supabase.from('student_skill').select('skill(skill_name)').eq('student_id', student_id),
      supabase.from('internship_skill').select('skill(skill_name)').eq('internship_id', internship_id),
      supabase.from('student').select('name, email').eq('student_id', student_id).single(),
    ]);

    const { data: internshipData } = await supabase
      .from('internship')
      .select(`
        title,
        description,
        company(company_name, email)
      `)
      .eq('internship_id', internship_id)
      .single();

    // Log any context errors but do NOT block the application — AI match can degrade gracefully
    if (studentRes.error) console.warn('⚠️ Student skills unavailable for AI match:', studentRes.error.message);
    if (internshipRes.error) console.warn('⚠️ Internship skills unavailable for AI match:', internshipRes.error.message);
    if (studentDataRes.error) console.warn('⚠️ Student profile partial:', studentDataRes.error.message);
    if (!internshipData) {
      return NextResponse.json({ success: false, error: 'The specified internship opportunity could not be located.' }, { status: 404 });
    }

    const studentSkills = (studentRes.data || []).map((s: any) => s.skill.skill_name);
    const requiredSkills = (internshipRes.data || []).map((r: any) => r.skill.skill_name);
    
    // AI MATCH ENGINE: Activation of Recruitment Intelligence Layer
    let aiMatchScore = 0;
    let aiInterviewQuestions = [];

    try {
      const cohereKey = process.env.COHERE_API_KEY;
      if (cohereKey) {
        const prompt = `You are a Technical Hiring Architect. 
        Evaluate a student candidate for the role: "${internshipData.title}".
        Role Description: "${internshipData.description}"
        Candidate Skills: ${studentSkills.join(', ')}
        
        Task: 
        1. Calculate a MATCH SCORE (0-100) based on industry relevance, NOT just keyword counting.
        2. Generate 3 specific, challenging Behavioral/System-Design INTERVIEW QUESTIONS for this candidate.
        
        Return ONLY a JSON object: {"score": number, "questions": ["q1", "q2", "q3"]}`;

        const res = await fetch('https://api.cohere.com/v1/chat', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${cohereKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: prompt, model: 'command-r-plus', temperature: 0.3 })
        });
        const aiData = await res.json();
        const parsed = JSON.parse(aiData.text.replace(/```json|```/g, '').trim());
        aiMatchScore = parsed.score || 0;
        aiInterviewQuestions = parsed.questions || [];
      } else {
        // Fallback to Deterministic Mock if key is missing
        aiMatchScore = AI_ENGINE.calculateMatchScore(studentSkills, requiredSkills);
        aiInterviewQuestions = AI_ENGINE.generateInterviewQuestions(studentSkills, internshipData.title);
      }
    } catch (aiErr) {
      aiMatchScore = AI_ENGINE.calculateMatchScore(studentSkills, requiredSkills);
      aiInterviewQuestions = AI_ENGINE.generateInterviewQuestions(studentSkills, internshipData.title);
    }

    // 3. Persist Application with Intelligence Payload
    const { data: newApp, error: insertError } = await supabase
      .from('application')
      .insert({
        student_id: student_id,
        internship_id: internship_id,
        status: 'Pending',
        ai_match_score: aiMatchScore,
        ai_interview_questions: aiInterviewQuestions
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Application persisting error:', insertError.message);
      return NextResponse.json({ success: false, error: getFriendlyErrorMessage(insertError) }, { status: 500 });
    }

    // POST-SUBMISSION: Candidate Pitch Generation for Auto-Fill Agent
    let aiPitch = "";
    if (process.env.COHERE_API_KEY && studentDataRes.data) {
      try {
        const studentName = studentDataRes.data?.name || 'Student';
        const pitchPrompt = `Generate a 2-sentence professional pitch for ${studentName} applying for ${internshipData.title}. 
        Skills: ${studentSkills.join(', ')}. Mention why they are a top match.`;
        
        const pitchRes = await fetch('https://api.cohere.com/v1/chat', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${process.env.COHERE_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: pitchPrompt, model: 'command-r-plus', temperature: 0.7 })
        });
        const pitchData = await pitchRes.json();
        aiPitch = pitchData.text || "";
      } catch (e) { console.error("Pitch generation delay...", e); }
    }

    // 4. Syndicate Notifications (fully guarded — non-fatal if student profile is incomplete)
    try {
      const student = studentDataRes.data;
      const company = (internshipData as any).company;
      if (student && company) {
        await Promise.all([
          notifyApplicationReceived(student_id, student.email, student.name, internshipData.title),
          notifyCompanyNewApplicant(company.email, student.name, internshipData.title)
        ]);
      }
    } catch (notifyError) {
      console.warn('⚡ Notification portal async delay...');
    }

    return NextResponse.json({ success: true, data: { ...newApp, ai_pitch: aiPitch } });
  } catch (error: unknown) {
    console.error('❌ Application POST Crash:', error);
    return NextResponse.json({ success: false, error: getFriendlyErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('applicationId');

    if (!appId) {
      return NextResponse.json({ success: false, error: 'Application Reference ID is required.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('application')
      .delete()
      .eq('application_id', appId);

    if (error) {
      console.error('❌ Application Deletion Error:', error.message);
      return NextResponse.json({ success: false, error: getFriendlyErrorMessage(error) }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('❌ Application DELETE Crash:', error);
    return NextResponse.json({ success: false, error: getFriendlyErrorMessage(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { application_id, status, ai_interview_guide } = body;

    if (!application_id || !status) {
      return NextResponse.json({ success: false, error: 'Application Identity and Status Update are required.' }, { status: 400 });
    }

    const updateData: any = { status };
    if (ai_interview_guide) updateData.ai_interview_questions = ai_interview_guide;

    const { data, error } = await supabase
      .from('application')
      .update(updateData)
      .eq('application_id', application_id)
      .select()
      .single();

    if (error) {
      console.error('❌ Application Update Error:', error.message);
      return NextResponse.json({ success: false, error: getFriendlyErrorMessage(error) }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error('❌ Application PATCH Crash:', error);
    return NextResponse.json({ success: false, error: getFriendlyErrorMessage(error) }, { status: 500 });
  }
}
