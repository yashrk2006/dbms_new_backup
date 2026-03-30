import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { AI_ENGINE } from '@/lib/ai-engine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }

    // 1. Fetch Student Skills
    const { data: skilledData, error: skillsError } = await supabase
      .from('student_skill')
      .select('proficiency_level, skill(skill_id, skill_name, category)')
      .eq('student_id', userId);

    if (skillsError) throw skillsError;

    const studentSkills = (skilledData || []).map((s: any) => ({
      skill_id: s.skill.skill_id,
      skill_name: s.skill.skill_name,
      proficiency_level: s.proficiency_level
    }));

    // 2. Fetch All Internships for AI Insights
    const { data: allInternshipsRaw } = await supabase
      .from('internship')
      .select(`
        *,
        internship_requirements(skill(skill_name))
      `);

    const allInternships = (allInternshipsRaw || []).map((i: any) => ({
      requirements: {
        role_skills: i.internship_requirements?.map((ir: any) => ir.skill.skill_name) || []
      }
    }));

    // 3. Fetch All Available Skills (for the dropdown/selection)
    const { data: allAvailableSkills } = await supabase
      .from('skill')
      .select('*');

    // AI Intelligence: Skill Evolution Predictor
    const studentSkillsNames = studentSkills.map(s => s.skill_name);
    const marketReach = AI_ENGINE.calculateMarketReach(studentSkillsNames, allInternships as any);
    const nextBestSkill = AI_ENGINE.getHighImpactSkill(studentSkillsNames, allInternships as any);

    return NextResponse.json({ 
      success: true, 
      studentSkills,
      allSkills: allAvailableSkills || [],
      aiInsights: {
        marketReach,
        nextBestSkill
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, skillName, proficiencyLevel, action } = await request.json();

    if (!userId || !skillName) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Find the skill_id for the given skillName
    const { data: skillItem } = await supabase
      .from('skill')
      .select('skill_id')
      .eq('skill_name', skillName)
      .single();

    if (!skillItem) {
      return NextResponse.json({ success: false, error: 'Skill not found in database' }, { status: 404 });
    }

    if (action === 'delete') {
      const { error } = await supabase
        .from('student_skill')
        .delete()
        .eq('student_id', userId)
        .eq('skill_id', skillItem.skill_id);
      
      if (error) throw error;
    } else {
      // Upsert skill in student_skill
      const { error } = await supabase
        .from('student_skill')
        .upsert({
          student_id: userId,
          skill_id: skillItem.skill_id,
          proficiency_level: proficiencyLevel
        }, { onConflict: 'student_id, skill_id' });
      
      if (error) throw error;
    }

    // Return the updated skill list
    const { data: updatedSkillsRaw } = await supabase
      .from('student_skill')
      .select('proficiency_level, skill(skill_id, skill_name, category)')
      .eq('student_id', userId);

    const updatedSkills = (updatedSkillsRaw || []).map((s: any) => ({
      skill_id: s.skill.skill_id,
      skill_name: s.skill.skill_name,
      proficiency_level: s.proficiency_level
    }));

    return NextResponse.json({ 
      success: true, 
      data: updatedSkills
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
