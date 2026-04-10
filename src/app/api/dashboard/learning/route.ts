import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let query = supabaseAdmin.from('course').select('*');

    // Personalized Filtering: If we have a userId, fetch their branch
    if (userId) {
      const { data: student } = await supabaseAdmin
        .from('student')
        .select('branch')
        .eq('student_id', userId)
        .maybeSingle();

      if (student?.branch) {
        // Map common branch names to course categories
        const branchMap: Record<string, string[]> = {
          'Computer Science': ['AI', 'Development', 'Cloud', 'Data Science'],
          'Information Technology': ['Network', 'Security', 'Web', 'DevOps'],
          'Electronics': ['Embedded', 'IoT', 'VLSI', 'Signal Processing'],
          'Mechanical': ['CAD', 'Robotics', 'Manufacturing', 'Automotive'],
          'Civil': ['Structural', 'Architecture', 'Urban Planning'],
          'Electrical': ['Power', 'Control Systems', 'Renewables']
        };

        const categories = branchMap[student.branch] || [student.branch];
        query = query.in('category', categories);
      }
    }

    const { data: courses, error } = await query
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) {
       console.error("Database query failed:", error.message);
       throw error;
    }

    // If filtered results are empty, return all courses as fallback
    if (courses?.length === 0) {
      const { data: fallback } = await supabaseAdmin
        .from('course')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);
      return NextResponse.json({ success: true, courses: fallback || [] });
    }

    return NextResponse.json({ success: true, courses: courses || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
