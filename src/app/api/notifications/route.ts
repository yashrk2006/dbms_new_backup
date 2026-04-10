import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('notification')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Notification fetch warning:', error.message);
      // Return empty array instead of failing hard if table is missing or RLS blocks
      return NextResponse.json({ success: true, data: [], notifications: [] });
    }
    
    // Return as 'data' for frontend compatibility (dashboard reads notifData.data)
    return NextResponse.json({ success: true, data, notifications: data });
  } catch (error: any) {
    console.error('Notification API Error:', error);
    return NextResponse.json({ success: true, data: [], notifications: [] });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, title, message, type = 'system' } = await request.json();

    if (!userId || !title || !message) {
      return NextResponse.json({ success: false, error: 'Missing notification payload' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('notification')
      .insert({ user_id: userId, title, message, type })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { notificationId, userId } = await request.json();

    if (notificationId) {
      // Mark single notification as read
      const { error } = await supabase
        .from('notification')
        .update({ is_read: true })
        .eq('notification_id', notificationId);
      if (error) throw error;
    } else if (userId) {
      // Mark all as read for a user
      const { error } = await supabase
        .from('notification')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      if (error) throw error;
    } else {
      return NextResponse.json({ success: false, error: 'notificationId or userId required' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
