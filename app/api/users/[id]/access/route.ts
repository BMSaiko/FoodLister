import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { validateProfileAccess } from '@/libs/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const response = new NextResponse();
    const supabase = await getServerClient(request, response) as any;
    
    // Get the authenticated user (optional)
    let currentUserId = null;
    try {
      const authResult = await supabase.auth.getUser();
      if (authResult.data?.user) {
        currentUserId = authResult.data.user.id;
      }
    } catch (error) {
      console.warn('Authentication check failed:', error);
    }

    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { canAccess: false, accessLevel: 'NONE', reason: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Validar acesso ao perfil
    const accessValidation = await validateProfileAccess(
      supabase,
      userId,
      currentUserId
    );

    return NextResponse.json({
      canAccess: accessValidation.canAccess,
      accessLevel: accessValidation.accessLevel,
      reason: accessValidation.reason,
      targetUserId: accessValidation.targetUserId
    });

  } catch (error) {
    console.error('Error in access validation GET:', error);
    return NextResponse.json(
      { canAccess: false, accessLevel: 'NONE', reason: 'Internal server error' },
      { status: 500 }
    );
  }
}