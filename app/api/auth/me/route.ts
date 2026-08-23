import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/verify-firebase';
import { getUserProfileByAuthId, getUserProfileByFirebaseUid } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  const result = await requireUser(request);
  if ('error' in result) return result.error;

  const profile =
    (await getUserProfileByAuthId(result.user.uid)) ||
    (await getUserProfileByFirebaseUid(result.user.uid));
  return NextResponse.json({
    uid: result.user.uid,
    email: result.user.email,
    name: profile?.name || result.user.name || '',
    role: profile?.role || 'user',
  });
}
