import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { AI_ENGINE } from '@/lib/ai-engine';

export async function GET() {
  try {
    // 1. Fetch Basic Counts
    const [
      { count: studentCount },
      { count: internshipCount },
      { count: applicationCount },
      { count: companyCount }
    ] = await Promise.all([
      supabase.from('student').select('*', { count: 'exact', head: true }),
      supabase.from('internship').select('*', { count: 'exact', head: true }),
      supabase.from('application').select('*', { count: 'exact', head: true }),
      supabase.from('company').select('*', { count: 'exact', head: true })
    ]);

    // 2. Fetch Data for AI Intelligence
    const [
      { data: studentsRaw },
      { data: internshipsRaw },
      { data: applicationsRaw },
      { data: allSkills }
    ] = await Promise.all([
      supabase.from('student').select('student_id, name, student_skill(skill(skill_name))'),
      supabase.from('internship').select('internship_id, title, internship_requirements(skill(skill_name))'),
      supabase.from('application').select('*').limit(20).order('applied_date', { ascending: false }),
      supabase.from('skill').select('skill_name')
    ]);

    const internships = (internshipsRaw || []).map((i: any) => ({
        id: i.internship_id.toString(),
        title: i.title,
        requirements: {
            role_skills: i.internship_requirements?.map((ir: any) => ir.skill.skill_name) || []
        }
    }));

    const students = (studentsRaw || []).map((s: any) => ({
        id: s.student_id,
        name: s.name,
        skills: s.student_skill?.map((sk: any) => ({ skill_name: sk.skill.skill_name })) || []
    }));

    // 3. AI Intelligence: Placement Risk Radar
    const atRisk = students.map((s: any) => {
        const studentAppsCount = (applicationsRaw || []).filter((a: any) => a.student_id === s.id).length;
        const studentSkillsNames = s.skills.map((sk: any) => sk.skill_name);
        const marketReach = AI_ENGINE.calculateMarketReach(studentSkillsNames, internships as any);
        
        let riskReason = '';
        if (studentAppsCount === 0) riskReason = 'Zero Applications (Inactive)';
        else if (marketReach < 30) riskReason = 'Low Market Alignment (Skill Gap)';

        return {
            student_id: s.id,
            name: s.name,
            reason: riskReason,
            marketReach
        };
    })
    .filter(s => s.reason !== '')
    .sort((a, b) => a.marketReach - b.marketReach)
    .slice(0, 4);

    // AI Intelligence: Market Equilibrium Predictor
    const marketEquilibrium = AI_ENGINE.getMarketEquilibrium(students as any, internships as any);

    // 4. Recent Intelligence Feed (Latest 10 Applications)
    const { data: recentAppsRaw } = await supabase
      .from('application')
      .select(`
        application_id,
        applied_date,
        status,
        student(name),
        internship(title)
      `)
      .order('applied_date', { ascending: false })
      .limit(10);

    const recentActivity = (recentAppsRaw || []).map((app: any) => ({
      id: app.application_id,
      type: 'APPLICATION',
      title: `${app.student?.name} applied for ${app.internship?.title}`,
      timestamp: app.applied_date,
      status: app.status
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats: {
            students: studentCount || 0,
            companies: companyCount || 0,
            internships: internshipCount || 0,
            applications: applicationCount || 0
        },
        recentApplications: applicationsRaw || [],
        recentActivity,
        skills: allSkills || [],
        atRisk,
        marketEquilibrium
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Admin Stats Error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
