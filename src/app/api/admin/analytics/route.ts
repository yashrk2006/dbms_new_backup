import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Student as IStudent, Internship as IInternship, Application as IApplication } from '@/types';

export async function GET() {
  try {
    // 1. Fetch All Data for Analytics
    const [
      { data: studentsRaw },
      { data: internshipsRaw },
      { data: applicationsRaw },
      { data: companiesRaw }
    ] = await Promise.all([
      supabase.from('student').select('student_id, student_skill(skill(skill_name))'),
      supabase.from('internship').select('internship_id, internship_skill(skill(skill_name))'),
      supabase.from('application').select('status, applied_date'),
      supabase.from('company').select('company_id', { count: 'exact', head: true })
    ]);

    const students = studentsRaw || [];
    const internships = internshipsRaw || [];
    const applications = applicationsRaw || [];
    const totalCompanies = companiesRaw?.length || 0;

    // 2. Placement Velocity (Monthly)
    // Group applications by month
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(currentMonth - (5 - i));
      return monthNames[d.getMonth()];
    });

    const placementVelocity = last6Months.map(month => {
      const monthApps = applications.filter((a: any) => {
        const d = new Date(a.applied_date);
        return monthNames[d.getMonth()] === month;
      });
      return {
        month,
        applications: monthApps.length,
        placements: monthApps.filter((a: any) => a.status === 'Accepted').length
      };
    });

    // 3. Skill Demand vs Supply
    const skillSupplyMap: Record<string, number> = {};
    const skillDemandMap: Record<string, number> = {};

    students.forEach((s: any) => {
      s.student_skill?.forEach((sk: any) => {
        const name = sk.skill.skill_name;
        skillSupplyMap[name] = (skillSupplyMap[name] || 0) + 1;
      });
    });

    internships.forEach((i: any) => {
      i.internship_skill?.forEach((ir: any) => {
        const name = ir.skill.skill_name;
        skillDemandMap[name] = (skillDemandMap[name] || 0) + 1;
      });
    });

    // Get top skills from demand map or a default set
    const topSkills = Object.keys(skillDemandMap).length > 0 
      ? Object.entries(skillDemandMap).sort((a,b) => b[1] - a[1]).slice(0, 6).map(e => e[0])
      : ['React', 'Node.js', 'Python', 'SQL', 'AWS', 'Machine Learning'];

    const skillGaps = topSkills.map(name => ({
      name,
      demand: skillDemandMap[name] || 0, 
      supply: skillSupplyMap[name] || 0
    }));

    // 4. Status Distribution
    const statusCounts = {
      Placed: applications.filter((a: any) => a.status === 'Accepted').length,
      Interviewing: applications.filter((a: any) => a.status === 'Interviewing').length,
      Searching: students.length - applications.filter((a: any) => a.status === 'Accepted').length
    };

    const statusDistribution = [
      { name: 'Placed', value: statusCounts.Placed, color: '#D97706' },
      { name: 'Interviewing', value: statusCounts.Interviewing, color: '#4F46E5' },
      { name: 'Searching', value: Math.max(0, statusCounts.Searching), color: '#94A3B8' },
    ];

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents: students.length,
        totalCompanies: totalCompanies,
        totalInternships: internships.length,
        activePlacements: applications.filter((a: any) => a.status === 'Accepted').length
      },
      placementData: placementVelocity,
      skillDemand: skillGaps,
      statusDistribution
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Admin Analytics Error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
