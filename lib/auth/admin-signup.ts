/**
 * Admin signup invite code. Prefer ADMIN_SIGNUP_CODE (server-only).
 * NEXT_PUBLIC_SIGN_UP_CODE is still read so existing .env.local keeps working,
 * but rotate to ADMIN_SIGNUP_CODE — public env is visible in the browser bundle.
 */

export function isAdminSignupConfigured(): boolean {
  return Boolean(adminSignupCode());
}

export function verifyAdminSignupCode(code: string): boolean {
  const expected = adminSignupCode();
  if (!expected) return false;
  if (!code?.trim()) return false;
  return timingSafeEqual(code.trim(), expected);
}

function adminSignupCode(): string | undefined {
  return process.env.ADMIN_SIGNUP_CODE?.trim() || process.env.NEXT_PUBLIC_SIGN_UP_CODE?.trim();
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
