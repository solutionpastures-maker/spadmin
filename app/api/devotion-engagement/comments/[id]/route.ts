import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import {
  deleteDevotionComment,
  updateDevotionCommentStatus,
  type ModerationStatus,
} from '@/lib/devotion-engagement-store';

const STATUSES: ModerationStatus[] = ['visible', 'flagged', 'removed'];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;
  const { id } = await params;
  try {
    const body = await request.json();
    const status = body.status as ModerationStatus;
    if (!STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    const data = await updateDevotionCommentStatus(id, status);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
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
    await deleteDevotionComment(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
