import { NextRequest, NextResponse } from 'next/server';
import { createNotification } from '@/libs/notifications/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, title, message, link } = body;

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, type, title, message' },
        { status: 400 }
      );
    }

    const result = await createNotification({ userId, type, title, message, link });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Notification created successfully' });
  } catch (error) {
    console.error('Error in notifications create:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
