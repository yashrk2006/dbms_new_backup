import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { AI_ENGINE } from '@/lib/ai-engine';
import { Application as IApplication, Student as IStudent, Internship as IInternship, Skill } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ success: false, error: 'Company ID required' }, { status: 400 });
    }

    // 1. Fetch Company Data
    const { data: company, error: companyError } = await supabase
      .from('company')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }

    // 2. Fetch Company Internships with Requirements
    const { data: internshipsRaw, error: internError } = await (supabase
      .from('internship')
      .select('*, internship_requirements(skill(skill_name))') as any)
      .eq('company_id', companyId);

    const internships: IInternship[] = (internshipsRaw || []).map((i: any) => ({
      id: i.internship_id.toString(),
      title: i.title,
      requirements: {
          role_skills: i.internship_requirements?.map((ir: any) => ir.skill.skill_name) || []
      }
    } as any));

    // 3. Fetch Applications for the company with student info
    // Filtering by internship_id is the reactive approach for high-fidelity data integrity.
    const internshipIds = internships.map(i => parseInt(i.id));
    const { data: filteredAppsRaw } = await (supabase
      .from('application')
      .select(`
        *,
        student(student_id, name, student_skill(skill(skill_name))),
        internship(internship_id, title)
      `) as any)
      .in('internship_id', internshipIds);

    const enrichedApplications = (filteredAppsRaw || []).map((app: any) => {
      const studentSkills = app.student?.student_skill?.map((sk: any) => sk.skill.skill_name) || [];
      const role = internships.find(i => i.id === app.internship_id.toString());
      const requiredSkills = role?.requirements.role_skills || [];
      
      const matchScore = AI_ENGINE.calculateMatchScore(studentSkills, requiredSkills);
      const interviewQuestions = (app.student && role) ? AI_ENGINE.generateInterviewQuestions(studentSkills, role.title) : [];

      return {
        application_id: app.application_id,
        status: app.status,
        applied_date: app.applied_date,
        student_name: app.student?.name || 'Unknown',
        role_title: app.internship?.title || 'Unknown Role',
        match_score: matchScore,
        ai_interview_guide: interviewQuestions
      };
    });

    // 4. Talent Discovery: Find top students not yet applied
    // Fetch all students and their skills
    const { data: allStudentsRaw } = await (supabase
      .from('student')
      .select('student_id, name, student_skill(skill(skill_name))') as any);

    const appliedStudentIds = new Set(enrichedApplications.map((a: any) => a.student_id));
    
    const talentPool = (allStudentsRaw || [])
      .filter((s: any) => !appliedStudentIds.has(s.student_id))
      .map((s: any) => {
        const studentSkills = s.student_skill?.map((sk: any) => sk.skill.skill_name) || [];
        
        // Find the best matching internship for this student
        const matches = internships.map((intern: any) => ({
          roleId: intern.id,
          title: intern.title,
          score: AI_ENGINE.calculateMatchScore(studentSkills, intern.requirements.role_skills)
        })).sort((a: any, b: any) => b.score - a.score);

        const bestMatch = matches[0] || null;

        return {
          id: s.student_id,
          name: s.name,
          skills: studentSkills,
          top_match: bestMatch ? {
            roleId: bestMatch.roleId,
            role: bestMatch.title,
            score: bestMatch.score
          } : null
        };
      })
      .filter((s: any) => s.top_match && s.top_match.score > 60)
      .sort((a: any, b: any) => (b.top_match?.score || 0) - (a.top_match?.score || 0))
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      stats: {
        activeRoles: internships.length,
        totalApplicants: enrichedApplications.length,
        pendingReview: enrichedApplications.filter((a: any) => a.status === 'Pending').length,
        interviewsScheduled: enrichedApplications.filter((a: any) => a.status === 'Interviewing').length,
        isVerified: company.is_verified
      },
      applications: enrichedApplications,
      talentDiscovery: talentPool
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Company Stats Error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
