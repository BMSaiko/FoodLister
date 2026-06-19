import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { createAdminClient } from '@/libs/supabase/admin';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await getServerClient(request, new NextResponse()) as any;
    if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { data: profile, error: pe } = await supabase.from('profiles').select('is_admin').eq('user_id', user.id).single();
    if (pe) console.error('Admin DELETE review - profile error:', pe.message || pe);
    if (!profile?.is_admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    const admin = createAdminClient();
    if (!admin) return NextResponse.json({ error: 'Service role key not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local' }, { status: 500 });
    const { error } = await admin.from('reviews').delete().eq('id', id);
    if (error) { console.error('Admin DELETE review - delete error:', error.message || error); return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 }); }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Admin DELETE review - catch:', error.message || error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
