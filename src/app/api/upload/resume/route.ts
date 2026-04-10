import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { PDFParse } from 'pdf-parse';

// BUILD_STABILIZATION_ID: REF_VER_002
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const studentId = formData.get('studentId') as string;

    if (!file || !studentId) {
      return NextResponse.json({ success: false, error: 'File and Student ID are required' }, { status: 400 });
    }

    // 1. Initial Storage Sync
    const fileExt = file.name.split('.').pop();
    const fileName = `${studentId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('resumes')
      .upload(filePath, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (uploadErr) throw uploadErr;

    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // 2. Intelligence Layer: PDF Extraction
    let extractedText = "";
    try {
      // Use the named export class for this specific pdf-parse version
      const parser = new PDFParse({ data: buffer });
      const textResult = await parser.getText();
      extractedText = textResult.text;
      await parser.destroy();
    } catch (parseErr) {
      console.warn("PDF Extraction failure:", parseErr);
    }

    // 3. AI Analysis & Skill Mapping
    let aiAnalysis = "Resume uploaded but AI analysis pending.";
    let extractedSkills: string[] = [];

    const cohereKey = process.env.COHERE_API_KEY;
    if (cohereKey && extractedText) {
      try {
        const prompt = `You are a Recruitment Intelligence Agent. Analyze the following resume text.
        
        TASK:
        1. Write a 2-sentence professional executive summary.
        2. Extract the TOP 5 technical skills as a comma-separated list.
        
        RESUME TEXT:
        ${extractedText.substring(0, 4000)}
        
        RETURN FORMAT:
        SUMMARY: [Your Summary]
        SKILLS: [Skill1, Skill2, Skill3, Skill4, Skill5]`;

        const res = await fetch('https://api.cohere.com/v1/chat', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${cohereKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: prompt, model: 'command-r-plus' })
        });
        const aiData = await res.json();
        const text = aiData.text || "";
        
        const summaryMatch = text.match(/SUMMARY:\s*(.*)/);
        const skillsMatch = text.match(/SKILLS:\s*(.*)/);
        
        if (summaryMatch) aiAnalysis = summaryMatch[1].trim();
        if (skillsMatch) {
          extractedSkills = skillsMatch[1].split(',').map((s: string) => s.trim().split(' ')[0]);
        }
      } catch (aiErr) {
        console.error("Cohere Intelligence Sync Error:", aiErr);
      }
    }

    // 4. Persistence: Dashboard State Sync
    await supabase
      .from('student')
      .update({ 
        resume_url: publicUrl,
        ai_resume_analysis: aiAnalysis
      })
      .eq('student_id', studentId);

    // Auto-populate skills if found
    if (extractedSkills.length > 0) {
      for (const skillName of extractedSkills) {
        let { data: skillObj } = await supabase
          .from('skill')
          .select('skill_id')
          .ilike('skill_name', skillName)
          .single();
        
        if (!skillObj) {
          const { data: newSkill, error: createErr } = await supabase
            .from('skill')
            .insert({ skill_name: skillName })
            .select('skill_id')
            .single();
          
          if (!createErr && newSkill) {
            skillObj = newSkill;
          }
        }

        if (skillObj) {
          await supabase
            .from('student_skill')
            .upsert({
              student_id: studentId,
              skill_id: skillObj.skill_id,
              proficiency_level: 'Intermediate'
            }, { onConflict: 'student_id, skill_id' });
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      analysis: aiAnalysis,
      skills_extracted: extractedSkills.length
    });
  } catch (error: any) {
    console.error('Final Pipeline Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
