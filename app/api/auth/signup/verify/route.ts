import { NextRequest, NextResponse } from 'next/server';
import {
  isAdminSignupConfigured,
  verifyAdminSignupCode,
} from '@/lib/auth/admin-signup';

export async function POST(request: NextRequest) {
  if (!isAdminSignupConfigured()) {
    return NextResponse.json(
      { valid: false, error: 'Admin signup is not configured' },
      { status: 503 }
    );
  }

  const body = await request.json();
  const signupCode = typeof body.signupCode === 'string' ? body.signupCode : '';

  if (!verifyAdminSignupCode(signupCode)) {
    return NextResponse.json({ valid: false, error: 'Invalid signup code' }, { status: 403 });
  }

  return NextResponse.json({ valid: true });
}
