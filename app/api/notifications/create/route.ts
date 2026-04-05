import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Use service role key to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await request.json();
    const { userId, type, title, message, link } = body;

    if (!userId || !type || !title || !message) {
      return NextResponse.json({ error: 'Missing required fields: userId, type, title, message' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        link: link || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }

    return NextResponse.json({ data, message: 'Notification created successfully' });
  } catch (error) {
    console.error('Error in notifications create:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}