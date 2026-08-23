import { NextRequest, NextResponse } from 'next/server';
import { apiErrorResponse } from '@/lib/api-error';
import { getContactMessages, updateContactMessageStatus, type InboxStatus } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/auth/require-admin';

export async function GET(request: NextRequest)  {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;

  try {
    const data = await getContactMessages();
    return NextResponse.json(data);
  } catch (error: unknown) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest)  {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;

  try {
    const body = await request.json();
    const id = typeof body.id === 'string' ? body.id : '';
    const status = body.status as InboxStatus;
    if (!id || !['new', 'read', 'archived'].includes(status)) {
      return NextResponse.json({ error: 'Invalid id or status' }, { status: 400 });
    }
    await updateContactMessageStatus(id, status);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return apiErrorResponse(error);
  }
}
