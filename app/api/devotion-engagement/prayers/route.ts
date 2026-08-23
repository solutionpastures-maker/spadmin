import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import { listDevotionPrayers } from '@/lib/devotion-engagement-store';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;
  try {
    const data = await listDevotionPrayers();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to load prayer requests' }, { status: 500 });
  }
}
