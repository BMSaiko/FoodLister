import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { getErrorMessage } from '@/types/api';
import type { ApiErrorType } from '@/types/api';
import { logActivity } from '@/libs/activity';
import { getListRole } from '@/libs/lists/permissions';
import { resolveListId } from '@/libs/slug';
import { createNotification } from '@/libs/notifications/service';

// GET - List all collaborators
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getServerClient(request, new NextResponse());
    if (!supabase) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 401 });
    }
    const { id } = await params;
    const listId = (await resolveListId(supabase, id)) ?? id;

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
      .eq('list_id', listId);

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

// POST - Add collaborator by user_id or user_id_code
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getServerClient(request, new NextResponse());
    if (!supabase) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 401 });
    }
    const { id } = await params;
    const listId = (await resolveListId(supabase, id)) ?? id;

    if (!id) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 400 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 401 });
    }

    // ponytail: only owner can manage collaborators
    const userListRole = await getListRole(supabase, listId, user.id);
    if (userListRole !== 'owner') {
      const errorType = 'AUTHORIZATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 403 });
    }

    const body = await request.json();
    const { user_id, user_id_code, role } = body;

    if (!user_id && !user_id_code) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 400 });
    }

    // Resolve user by user_id or user_id_code
    let targetUser: { user_id: string; display_name: string | null } | null = null;

    if (user_id) {
      const { data, error: userError } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .eq('user_id', user_id)
        .single();
      if (!userError && data) targetUser = data;
    } else if (user_id_code) {
      const { data, error: userError } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .eq('user_id_code', user_id_code.toUpperCase())
        .single();
      if (!userError && data) targetUser = data;
    }

    if (!targetUser) {
      const errorType = 'NOT_FOUND' as ApiErrorType;
      return NextResponse.json({ error: "Utilizador não encontrado", code: errorType }, { status: 404 });
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
        return NextResponse.json({ error: "Utilizador já é colaborador", code: errorType }, { status: 409 });
      }
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
    }

    // Log activity
    if (user) {
      await logActivity(supabase, id, user.id, 'collaborator_added', {
        collaborator_user_id: targetUser.user_id,
        collaborator_name: targetUser.display_name,
      });
    }

    // ponytail: notify the added collaborator (best-effort)
    const [{ data: inviterProfile }, { data: listRow }] = await Promise.all([
      supabase.from('profiles').select('display_name').eq('user_id', user.id).maybeSingle(),
      supabase.from('lists').select('name').eq('id', listId).maybeSingle(),
    ]);
    createNotification({
      userId: targetUser.user_id,
      type: 'list_invite',
      title: 'Convite para lista',
      message: `${inviterProfile?.display_name || 'Alguém'} adicionou-te como colaborador da lista ${listRow?.name ?? 'a lista'}.`,
      link: `/lists/${id}`,
    }).catch(() => {});

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
    const supabase = await getServerClient(request, new NextResponse());
    if (!supabase) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 401 });
    }
    const { id } = await params;
    const listId = (await resolveListId(supabase, id)) ?? id;

    if (!id) {
      const errorType = 'VALIDATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 400 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      const errorType = 'AUTHENTICATION_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 401 });
    }

    // ponytail: only owner can manage collaborators
    const userListRole = await getListRole(supabase, listId, user.id);
    if (userListRole !== 'owner') {
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
      .eq('list_id', listId)
      .eq('user_id', userId);

    if (deleteError) {
      const errorType = 'DATABASE_ERROR' as ApiErrorType;
      return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
    }

    // Log activity
    if (user) {
      await logActivity(supabase, id, user.id, 'collaborator_removed', {
        removed_user_id: userId,
      });
    }

    return NextResponse.json({ success: true, message: 'Collaborator removed successfully' });
  } catch (_error: unknown) {
    const errorType = 'INTERNAL_ERROR' as ApiErrorType;
    return NextResponse.json({ error: getErrorMessage(errorType), code: errorType }, { status: 500 });
  }
}