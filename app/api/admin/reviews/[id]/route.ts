import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const response = new NextResponse();
    const supabase = await getServerClient(request, response) as any;
    if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('user_id', user.id).single();
    if (!profile?.is_admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

