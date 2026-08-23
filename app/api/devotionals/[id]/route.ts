import { NextRequest, NextResponse } from 'next/server';
import { apiErrorResponse } from '@/lib/api-error';
import { requireAdmin } from '@/lib/auth/require-admin';
import {
  getDevotionalById,
  updateDevotional,
  deleteDevotional,
} from '../../../../lib/supabase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
)  {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;

  try {
    const { id } = await params;
    const data = await getDevotionalById(id);
    return NextResponse.json(data);
  } catch (error: unknown) {
    return apiErrorResponse(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
)  {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const data = await updateDevotional(id, body);
    return NextResponse.json(data);
  } catch (error: unknown) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
)  {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;

  try {
    const { id } = await params;
    await deleteDevotional(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return apiErrorResponse(error);
  }
}
