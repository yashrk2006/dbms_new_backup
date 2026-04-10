import { NextResponse } from 'next/server';
import { analyzeResumeAgent } from '@/lib/agents';
import { supabase } from '@/lib/supabase';
export async function POST(request: Request) {
  try {
    const pdf = require('pdf-parse');
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ success: false, error: 'Expected multipart/form-data POST' }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    // Size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'PDF exceeds 10MB limit' }, { status: 400 });
    }

    let text = '';
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const data = await pdf(buffer);
      text = data.text;
    } catch (parseError: any) {
      console.error('PDF Parse Internal Error:', parseError);
      return NextResponse.json({ 
        success: false, 
        error: `Core logic failure: ${parseError.message || 'The Neural Core encountered a PDF library crash. Ensure standard PDF format.'}` 
      }, { status: 500 });
    }

    if (!text || text.trim().length < 5) {
      return NextResponse.json({ 
        success: false, 
        error: 'The uploaded document appears to be empty or unscannable. Please provide a standard PDF resume.' 
      }, { status: 400 });
    }

    const result = await analyzeResumeAgent(text);

    if (userId) {
      try {
        await supabase
          .from('student')
          .update({ ai_resume_analysis: result } as any)
          .eq('student_id', userId);
      } catch (dbError) {
        console.warn('⚡ Analysis persisted to runtime but database sync lagged.');
      }
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Global Resume Analysis Crash:', error);
    // CRITICAL: Ensure NO HTML is ever returned here
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'The Neural Engine encountered an unexpected system-level error. Please ensure the file is a standard PDF.' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
