import { NextResponse } from 'next/server';
import { skillGapAgent } from '@/lib/agents';

// Handle Skill Gap Analysis
export async function POST(request: Request) {
  try {
    const { studentSkills, requiredSkills } = await request.json();
    if (!studentSkills || !requiredSkills) {
      return NextResponse.json({ success: false, error: 'studentSkills and requiredSkills arrays are required.' }, { status: 400 });
    }

    const result = await skillGapAgent(studentSkills, requiredSkills);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
