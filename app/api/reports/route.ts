// T48 — POST /api/reports : user logado reporta alvo (qualquer user autenticado).
import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/libs/supabase/server';
import { getErrorMessage } from '@/types/api';
import type { ApiErrorType } from '@/types/api';

const TARGETS = ['restaurant', 'review', 'list', 'profile'];
const REASONS = ['closed', 'wrong_data', 'prices', 'other', 'spam', 'offensive'];

export async function POST(request: NextRequest) {
  const auth = await requireUser(request, new NextResponse());
  if (!auth.ok) return auth.response;

  let body: any = {};
  try { body = await request.json(); } catch { /* empty */ }

  const { target_type, target_id, reason, details } = body;
  if (!TARGETS.includes(target_type) || !target_id || !REASONS.includes(reason)) {
    const et = 'VALIDATION_ERROR' as ApiErrorType;
    return NextResponse.json({ error: getErrorMessage(et), code: et }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from('reports')
    .insert({
      target_type,
      target_id,
      reporter_id: auth.user.id,
      reason,
      details: details || null,
    });

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Já reportaste este item. Obrigado!', code: 'DUPLICATE_REPORT' },
        { status: 409 }
      );
    }
    console.error('Report insert error:', error.message || error);
    const et = 'DATABASE_ERROR' as ApiErrorType;
    return NextResponse.json({ error: getErrorMessage(et), code: et }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
