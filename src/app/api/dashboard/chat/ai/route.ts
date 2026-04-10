import { NextResponse } from 'next/server';
import { studentAssistantAgent } from '@/lib/agents';

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
    }

    const aiResponse = await studentAssistantAgent(message, history || []);

    return NextResponse.json({ success: true, response: aiResponse });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
