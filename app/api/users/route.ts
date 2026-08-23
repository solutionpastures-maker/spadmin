import { NextRequest, NextResponse } from 'next/server';
import { apiErrorResponse } from '@/lib/api-error';
import { requireAdmin } from '@/lib/auth/require-admin';
import { getUserProfiles, getUserProfileByFirebaseUid, getUserProfileByAuthId } from '../../../lib/supabase-admin';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;

  const authUserId = request.nextUrl.searchParams.get('auth_user_id');
  const firebaseUid = request.nextUrl.searchParams.get('firebase_uid');

  try {
    if (authUserId) {
      const profile = await getUserProfileByAuthId(authUserId);
      if (!profile) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json(profile);
    }

    if (firebaseUid) {
      const profile = await getUserProfileByFirebaseUid(firebaseUid);
      if (!profile) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json(profile);
    }

    const data = await getUserProfiles();
    return NextResponse.json(data);
  } catch (error: unknown) {
    return apiErrorResponse(error);
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Create members from the website or app sign-up. Staff accounts use /api/auth/signup.' },
    { status: 405 }
  );
}
