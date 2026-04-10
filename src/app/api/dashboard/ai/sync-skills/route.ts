import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { userId, skills } = await request.json();
    
    if (!userId || !skills || !Array.isArray(skills)) {
      return NextResponse.json({ success: false, error: 'User ID and valid skills list required' }, { status: 400 });
    }

    // 1. Get or Create Skill IDs for these keywords
    const results = [];
    for (const skillName of skills) {
      // Upsert skill
      const { data: skillData, error: skillError } = await supabase
        .from('skill')
        .select('skill_id')
        .eq('skill_name', skillName)
        .maybeSingle();

      let skillId;
      if (!skillData) {
        const { data: newSkill, error: createError } = await supabase
          .from('skill')
          .insert({ skill_name: skillName, category: 'Professional' })
          .select()
          .single();
        if (createError) continue;
        skillId = newSkill.skill_id;
      } else {
        skillId = skillData.skill_id;
      }

      // 2. Attach to Student Skill
      await supabase
        .from('student_skill')
        .upsert({ 
          student_id: userId, 
          skill_id: skillId, 
          proficiency_level: 'Intermediate' 
        }, { onConflict: 'student_id, skill_id' });
      
      results.push(skillName);
    }

    return NextResponse.json({ success: true, synced: results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
