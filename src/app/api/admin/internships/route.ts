import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch all internships with company and count of applications and requirements
    const { data: internships, error } = await supabase
      .from('internship')
      .select(`
        *,
        company(company_name),
        application(count),
        internship_skill(count)
      `);

    if (error) throw error;

    const enriched = (internships || []).map((i: any) => {
      const appCount = i.application?.[0]?.count || 0;
      const reqCount = i.internship_skill?.[0]?.count || 0;
      
      // AI Heuristic: Calculate Role Health
      // Critical Role: < 2 apps after some time (simulated)
      // High Demand: > 10 apps
      const health = appCount < 2 ? 'Critical' : appCount > 10 ? 'High Demand' : 'Healthy';
      const saturation = Math.min(100, Math.round((appCount / 20) * 100)); // 20 is target capacity

      return {
        internship_id: i.internship_id.toString(),
        title: i.title,
        duration: i.duration,
        stipend: i.stipend,
        location: i.location,
        company: { company_name: i.company?.company_name || 'Independent' },
        req_count: reqCount,
        app_count: appCount,
        health,
        saturation
      };
    });

    return NextResponse.json({ success: true, data: enriched });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
