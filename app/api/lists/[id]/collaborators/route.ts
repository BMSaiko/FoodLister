import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';

// GET - List all collaborators
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'List ID is required' }, { status: 400 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      return NextResponse.json({ error: 'Failed to fetch collaborators', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ collaborators: collaborators || [] });
  } catch (_error: unknown) {
    return NextResponse.json({ error: 'Internal server error', details: 'Unknown error' }, { status: 500 });
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'List ID is required' }, { status: 400 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check list ownership
    const { data: list } = await supabase.from('lists').select('creator_id').eq('id', id).single();
    if (!list || list.creator_id !== user.id) {
      return NextResponse.json({ error: 'Only the list owner can manage collaborators' }, { status: 403 });
    }

    const body = await request.json();
    const { email, role } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user by email
    const { data: targetUser, error: userError } = await supabase
      .from('profiles')
      .select('user_id, display_name')
      .ilike('display_name', email)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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
        return NextResponse.json({ error: 'User is already a collaborator' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to add collaborator', details: createError.message }, { status: 500 });
    }

    return NextResponse.json({ collaborator, message: 'Collaborator added successfully' });
  } catch (_error: unknown) {
    return NextResponse.json({ error: 'Internal server error', details: 'Unknown error' }, { status: 500 });
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'List ID is required' }, { status: 400 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check list ownership
    const { data: list } = await supabase.from('lists').select('creator_id').eq('id', id).single();
    if (!list || list.creator_id !== user.id) {
      return NextResponse.json({ error: 'Only the list owner can manage collaborators' }, { status: 403 });
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from('list_collaborators')
      .delete()
      .eq('list_id', id)
      .eq('user_id', userId);

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to remove collaborator', details: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Collaborator removed successfully' });
  } catch (_error: unknown) {
    return NextResponse.json({ error: 'Internal server error', details: 'Unknown error' }, { status: 500 });
  }
}
