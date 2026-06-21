import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { createAdminClient } from '@/libs/supabase/admin';
import { getErrorMessage } from '@/types/api';
import type { ApiErrorType } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    const response = new NextResponse();
    const supabase = await getServerClient(request, response) as any;

    if (!supabase) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 401 }
      );
    }

    // Verify admin access
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 401 }
      );
    }

    // Check if current user is admin
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();

    if (!adminProfile?.is_admin) {
      const errorType = 'AUTHORIZATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 403 }
      );
    }

    const { userId, action = 'deactivate' } = await request.json();

    if (!userId) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS for updating other users
    const admin = createAdminClient();
    if (!admin) {
      const errorType = 'SERVICE_ROLE_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: 'Admin client not configured', code: errorType },
        { status: 500 }
      );
    }

    // Determine is_active based on action
    const isActive = action === 'reactivate';

    // Soft delete: set is_active (NEVER hard delete)
    const { error: updateError } = await admin
      .from('profiles')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error deactivating user:', updateError);
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json(
        { error: getErrorMessage(errorType), code: errorType },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: isActive ? 'Utilizador reativado com sucesso' : 'Utilizador desativado com sucesso',
      userId,
      isActive,
    });

  } catch (error) {
    console.error('Error in deactivate user:', error);
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json(
      { error: getErrorMessage(errorType), code: errorType },
      { status: 500 }
    );
  }
}
