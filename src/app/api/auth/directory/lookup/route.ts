import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

/**
 * Institutional Identity Lookup
 * Accepts a Roll Number or Enrollment ID and verifies membership in the batch.
 */
export async function POST(request: Request) {
  try {
    const { identifier } = await request.json();

    if (!identifier) {
      return NextResponse.json({ error: 'Roll Number or Enrollment ID required' }, { status: 400 });
    }

    // Query the Institutional Directory (bypassing RLS with Admin client)
    const { data, error } = await supabaseAdmin
      .from('college_directory')
      .select('name, roll_no, enrollment_no, course, branch, batch_year')
      .or(`roll_no.eq."${identifier}",enrollment_no.eq."${identifier}"`)
      .single();

    if (error) {
      console.error('❌ Database Query Error:', error.message);
    }

    if (error || !data) {
      console.warn('❌ Institutional lookup failed for:', identifier);
      return NextResponse.json({ 
        error: error?.message || 'Record not found in the verified institutional batch directory.' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      student: {
        name: data.name,
        roll_no: data.roll_no,
        enrollment_no: data.enrollment_no,
        course: data.course,
        branch: data.branch,
        batch_year: data.batch_year
      }
    });

  } catch (error: any) {
    console.error('❌ Lookup Error:', error.message || error);
    return NextResponse.json({ 
        error: 'Internal server error',
        details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}
