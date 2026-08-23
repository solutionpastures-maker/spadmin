import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/verify-firebase';
import { getUserProfileByAuthId, getUserProfileByFirebaseUid } from '@/lib/supabase-admin';

export async function requireAdmin(request: NextRequest) {
  const result = await requireUser(request);
  if ('error' in result) return result;

  const profile =
    (await getUserProfileByAuthId(result.user.uid)) ||
    (await getUserProfileByFirebaseUid(result.user.uid));
  if (!profile || profile.role !== 'admin') {
    return {
      error: NextResponse.json({ error: 'Admin access required' }, { status: 403 }),
    };
  }

  return { user: result.user, profile };
}
