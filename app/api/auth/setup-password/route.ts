import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const GENERIC =
  'If we have an account or church profile for that email, you will receive a link to create or reset your password.';

function siteOrigin(request: NextRequest) {
  const fromEnv = process.env.NEXT_PUBLIC_ADMIN_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  const origin = request.headers.get('origin');
  if (origin) return origin;
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || 'http';
  return host ? `${proto}://${host}` : 'http://localhost:3001';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Enter a valid email' }, { status: 400 });
    }

    const redirectTo = `${siteOrigin(request)}/set-password`;
    const admin = getSupabaseAdmin();

    const { data: profile } = await admin
      .from('user_profiles')
      .select('id, auth_user_id, email, name')
      .ilike('email', email)
      .maybeSingle();

    if (profile && !profile.auth_user_id) {
      const { error } = await admin.auth.admin.inviteUserByEmail(email, {
        redirectTo,
        data: { name: profile.name },
      });
      if (error && /already|registered|exists/i.test(error.message)) {
        await admin.auth.resetPasswordForEmail(email, { redirectTo });
      } else if (error) {
        console.error('inviteUserByEmail', error.message);
      }
      return NextResponse.json({ ok: true, message: GENERIC });
    }

    await admin.auth.resetPasswordForEmail(email, { redirectTo });
    return NextResponse.json({ ok: true, message: GENERIC });
  } catch (error) {
    console.error('setup-password', error);
    return NextResponse.json({ ok: true, message: GENERIC });
  }
}
