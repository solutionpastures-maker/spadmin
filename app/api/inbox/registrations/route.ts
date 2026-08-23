import { NextRequest, NextResponse } from 'next/server';
import { apiErrorResponse } from '@/lib/api-error';
import { requireAdmin } from '@/lib/auth/require-admin';
import {
  getEventRegistrations,
  updateEventRegistrationStatus,
  type InboxStatus,
} from '@/lib/supabase-admin';

export async function GET(request: NextRequest)  {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;

  try {
    const eventId = request.nextUrl.searchParams.get('eventId') ?? undefined;
    const data = await getEventRegistrations(eventId || undefined);
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
    await updateEventRegistrationStatus(id, status);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return apiErrorResponse(error);
  }
}
