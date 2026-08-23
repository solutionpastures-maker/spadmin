import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import { listLiveQuestions } from '@/lib/live-store';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;
  try {
    const serviceId = request.nextUrl.searchParams.get('service_id') || undefined;
    const data = await listLiveQuestions(serviceId);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to load questions' }, { status: 500 });
  }
}
