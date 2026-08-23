import { NextRequest, NextResponse } from 'next/server';
import { apiErrorResponse } from '@/lib/api-error';
import { getDevotionals, createDevotional } from '../../../lib/supabase-admin';
import { requireAdmin } from '@/lib/auth/require-admin';

export async function GET(request: NextRequest)  {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;

  try {
    const data = await getDevotionals();
    return NextResponse.json(data);
  } catch (error: unknown) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: NextRequest)  {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;

  try {
    const body = await request.json();
    const data = await createDevotional(body);
    return NextResponse.json(data);
  } catch (error: unknown) {
    return apiErrorResponse(error);
  }
}
