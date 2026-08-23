import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import { deleteLiveQuestion, updateLiveQuestionStatus, type LiveQuestionStatus } from '@/lib/live-store';

const STATUSES: LiveQuestionStatus[] = ['pending', 'answered', 'dismissed'];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;
  const { id } = await params;
  try {
    const body = await request.json();
    const status = body.status as LiveQuestionStatus;
    if (!STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    const data = await updateLiveQuestionStatus(id, status);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
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
    await deleteLiveQuestion(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
  }
}
