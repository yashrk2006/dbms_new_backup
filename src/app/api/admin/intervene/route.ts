import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendCustomNotification } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const { student_id, action, message } = await request.json();

    if (!student_id && action !== 'notify_all') {
      return NextResponse.json({ success: false, error: 'Student ID is required' }, { status: 400 });
    }

    if (action === 'assign_mentor') {
      // 1. Update Student Mentorship Status
      const { data, error } = await supabase
        .from('student')
        .update({ mentorship_status: 'Active' as any })
        .eq('student_id', student_id)
        .select()
        .single();
      
      if (error) throw error;

      // 2. Notify Student
      const studentEmail = data.email;
      await sendCustomNotification(
        studentEmail, 
        "AI Mentorship Activated", 
        "An administrator has assigned an AI Growth Mentor to your profile. Check your learning path for new modules."
      );

      return NextResponse.json({ success: true, student: data });
    }

    if (action === 'notify_at_risk' || action === 'notify_all') {
        // Bulk notification logic
        const query = supabase.from('student').select('email, name');
        if (student_id) query.eq('student_id', student_id);
        
        const { data: students } = await query;
        
        if (students) {
            await Promise.all(students.map((s: any) => 
                sendCustomNotification(s.email, "Strategic Update from Admin", message || "Please review your performance metrics in the SkillSync portal.")
            ));
        }
        
        return NextResponse.json({ success: true, count: students?.length || 0 });
    }

    return NextResponse.json({ success: false, error: 'Invalid action payload' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
