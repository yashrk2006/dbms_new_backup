import { NextResponse } from 'next/server';
import { jobMatchingAgent } from '@/lib/agents';

// Handle Job Matching
export async function POST(request: Request) {
  try {
    const { skills } = await request.json();
    if (!skills || !Array.isArray(skills)) {
      return NextResponse.json({ success: false, error: 'Array of skills is required.' }, { status: 400 });
    }

    const result = await jobMatchingAgent(skills);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
