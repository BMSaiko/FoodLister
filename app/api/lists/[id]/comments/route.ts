import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';

// GET - Fetch all comments for a list
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'List ID is required' }, { status: 400 });
    }

    const { data: comments, error } = await supabase
      .from('list_comments')
      .select(`
        *,
        profiles (
          display_name,
          avatar_url
        )
      `)
      .eq('list_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json({ error: 'Failed to fetch comments', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ comments: comments || [] });
  } catch (_error: unknown) {
    return NextResponse.json({ error: 'Internal server error', details: 'Unknown error' }, { status: 500 });
  }
}

// POST - Create a new comment
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

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { comment } = body;

    if (!comment || comment.trim().length === 0) {
      return NextResponse.json({ error: 'Comment is required' }, { status: 400 });
    }

    // Get user's display name
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', user.id)
      .single();

    const { data: newComment, error: createError } = await supabase
      .from('list_comments')
      .insert({
        list_id: id,
        user_id: user.id,
        comment: comment.trim(),
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating comment:', createError);
      return NextResponse.json({ error: 'Failed to create comment', details: createError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      comment: {
        ...newComment,
        profiles: {
          display_name: profile?.display_name || 'Utilizador',
          avatar_url: null,
        }
      }
    });
  } catch (_error: unknown) {
    return NextResponse.json({ error: 'Internal server error', details: 'Unknown error' }, { status: 500 });
  }
}

// DELETE - Delete a comment
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

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const commentId = url.searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    // Check if user owns the comment
    const { data: comment, error: fetchError } = await supabase
      .from('list_comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (fetchError || !comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (comment.user_id !== user.id) {
      return NextResponse.json({ error: 'You can only delete your own comments' }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from('list_comments')
      .delete()
      .eq('id', commentId);

    if (deleteError) {
      console.error('Error deleting comment:', deleteError);
      return NextResponse.json({ error: 'Failed to delete comment', details: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Comment deleted successfully' });
  } catch (_error: unknown) {
    return NextResponse.json({ error: 'Internal server error', details: 'Unknown error' }, { status: 500 });
  }
}
