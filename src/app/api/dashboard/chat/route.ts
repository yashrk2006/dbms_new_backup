import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }

    const { data: messages, error } = await supabase
      .from('message')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: true });

    if (error) {
       return NextResponse.json({ success: true, messages: [
           { id: '1', sender_id: 'system', content: 'Welcome to your Workspace Chat. Syncing history...', created_at: new Date() }
       ] });
    }

    return NextResponse.json({ success: true, messages: messages || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { senderId, receiverId, content } = await request.json();
    
    const { data: message, error } = await supabase
      .from('message')
      .insert([{ sender_id: senderId, receiver_id: receiverId, content }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
