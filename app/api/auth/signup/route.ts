import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, upsertAdminProfile } from '@/lib/supabase-admin';
import {
  isAdminSignupConfigured,
  verifyAdminSignupCode,
} from '@/lib/auth/admin-signup';

export async function POST(request: NextRequest) {
  try {
    if (!isAdminSignupConfigured()) {
      return NextResponse.json(
        { error: 'Admin signup is not configured. Set ADMIN_SIGNUP_CODE in .env.local.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const signupCode = typeof body.signupCode === 'string' ? body.signupCode : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!verifyAdminSignupCode(signupCode)) {
      return NextResponse.json({ error: 'Invalid signup code' }, { status: 403 });
    }

    if (!name || !email || password.length < 8) {
      return NextResponse.json(
        { error: 'Name, email, and a password of at least 8 characters are required' },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();
    const created = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (created.error || !created.data.user) {
      const message = created.error?.message || 'Could not create account';
      if (/already|registered|exists/i.test(message)) {
        return NextResponse.json(
          {
            error:
              'An account with this email already exists. Sign in, or use Create password if you used the old app.',
          },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const data = await upsertAdminProfile({
      authUserId: created.data.user.id,
      name,
      email,
    });

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Signup failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
