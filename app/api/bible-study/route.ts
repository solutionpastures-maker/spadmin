import { NextRequest, NextResponse } from 'next/server';
import { createBibleStudyTopic, getBibleStudyTopics } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/auth/require-admin';

export async function GET(request: NextRequest)  {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;

  try {
    const data = await getBibleStudyTopics();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest)  {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;

  try {
    const body = await request.json();
    const data = await createBibleStudyTopic(body);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
