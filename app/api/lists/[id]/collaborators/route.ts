import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { getErrorMessage } from '@/types/api';
import type { ApiErrorType } from '@/types/api';

// GET - List all collaborators
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getServerClient();
    if (!supabase) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 401 });
    }
    const { id } = await params;

    if (!id) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 400 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 401 });
    }

    const { data: collaborators, error } = await supabase
      .from('list_collaborators')
      .select(`
        *,
        profiles (
          display_name,
          avatar_url
        )
      `)
      .eq('list_id', id);

    if (error) {
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
    }

    return NextResponse.json({ collaborators: collaborators || [] });
  } catch (_error: unknown) {
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
  }
}

// POST - Add collaborator by email
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getServerClient();
    if (!supabase) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 401 });
    }
    const { id } = await params;

    if (!id) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 400 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 401 });
    }

    // Check list ownership
    const { data: list } = await supabase.from('lists').select('creator_id').eq('id', id).single();
    if (!list || list.creator_id !== user.id) {
      const errorType = 'AUTHORIZATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 403 });
    }

    const body = await request.json();
    const { email, role } = body;

    if (!email) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 400 });
    }

    // Find user by email
    const { data: targetUser, error: userError } = await supabase
      .from('profiles')
      .select('user_id, display_name')
      .ilike('display_name', email)
      .single();

    if (userError || !targetUser) {
      const errorType = 'NOT_FOUND' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 404 });
    }

    const { data: collaborator, error: createError } = await supabase
      .from('list_collaborators')
      .insert({
        list_id: id,
        user_id: targetUser.user_id,
        role: role || 'editor',
      })
      .select()
      .single();

    if (createError) {
      if (createError.code === '23505') {
        const errorType = 'VALIDATION_ERROR' as ApiErrorType;
        return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 409 });
      }
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
    }

    return NextResponse.json({ collaborator, message: 'Collaborator added successfully' });
  } catch (_error: unknown) {
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
  }
}

// DELETE - Remove collaborator
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getServerClient();
    if (!supabase) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 401 });
    }
    const { id } = await params;

    if (!id) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 400 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 401 });
    }

    // Check list ownership
    const { data: list } = await supabase.from('lists').select('creator_id').eq('id', id).single();
    if (!list || list.creator_id !== user.id) {
      const errorType = 'AUTHORIZATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 403 });
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from('list_collaborators')
      .delete()
      .eq('list_id', id)
      .eq('user_id', userId);

    if (deleteError) {
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Collaborator removed successfully' });
  } catch (_error: unknown) {
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
  }
}