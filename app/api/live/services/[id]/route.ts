import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import { deleteLiveService, getLiveService, updateLiveService } from '@/lib/live-store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;
  const { id } = await params;
  try {
    const data = await getLiveService(id);
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to load live service' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;
  const { id } = await params;
  try {
    const body = await request.json();
    const data = await updateLiveService(id, body);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to update live service' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;
  const { id } = await params;
  try {
    await deleteLiveService(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete live service' }, { status: 500 });
  }
}
