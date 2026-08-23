import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import { listDevotionComments } from '@/lib/devotion-engagement-store';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;
  try {
    const data = await listDevotionComments();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to load comments' }, { status: 500 });
  }
}
