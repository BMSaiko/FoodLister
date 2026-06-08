import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/libs/supabase/server';
import { createAdminClient } from '@/libs/supabase/admin';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await getServerClient(request, new NextResponse()) as any;
    if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { data: profile, error: pe } = await supabase.from('profiles').select('is_admin').eq('user_id', user.id).single();
    if (pe) console.error('Admin PUT user - profile error:', pe.message || pe);
    if (!profile?.is_admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    const admin = createAdminClient();
    const body = await request.json();
    const updates: Record<string, any> = {};
    if (typeof body.is_admin === 'boolean') updates.is_admin = body.is_admin;
    const { data, error } = await admin.from('profiles').update(updates).eq('user_id', id).select().single();
    if (error) { console.error('Admin PUT user - update error:', error.message || error); return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 }); }
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Admin PUT user - catch:', error.message || error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
