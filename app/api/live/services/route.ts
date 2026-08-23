import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createLiveService, listLiveServices } from '@/lib/live-store';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;
  try {
    const data = await listLiveServices();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to load live services' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;
  try {
    const body = await request.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    const data = await createLiveService({
      title,
      speaker: typeof body.speaker === 'string' ? body.speaker.trim() : undefined,
      description: typeof body.description === 'string' ? body.description.trim() : undefined,
      scheduled_start: body.scheduled_start || null,
      scheduled_end: body.scheduled_end || null,
      stream_key: typeof body.stream_key === 'string' ? body.stream_key.trim() : 'teaching',
      whep_url: typeof body.whep_url === 'string' ? body.whep_url.trim() : undefined,
      hls_url: typeof body.hls_url === 'string' ? body.hls_url.trim() : undefined,
    });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to create live service' }, { status: 500 });
  }
}
