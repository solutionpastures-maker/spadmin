import { NextRequest, NextResponse } from 'next/server';
import { apiErrorResponse } from '@/lib/api-error';
import { getComments } from '../../../lib/supabase-admin';
import { requireAdmin } from '@/lib/auth/require-admin';

export async function GET(request: NextRequest)  {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const episodeId = searchParams.get('episodeId') ?? undefined;
    const data = await getComments(episodeId);
    return NextResponse.json(data);
  } catch (error: unknown) {
    return apiErrorResponse(error);
  }
}
