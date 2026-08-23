import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export type VerifiedUser = { uid: string; email?: string; name?: string };

export async function requireFirebaseUser(request: NextRequest) {
  return requireUser(request);
}

export async function requireUser(request: NextRequest): Promise<{ user: VerifiedUser } | { error: NextResponse }> {
  const header = request.headers.get('authorization') || request.headers.get('Authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) {
    return { error: NextResponse.json({ error: 'Sign in required' }, { status: 401 }) };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return { error: NextResponse.json({ error: 'Sign in required' }, { status: 401 }) };
  }

  return {
    user: {
      uid: data.user.id,
      email: data.user.email,
      name: typeof data.user.user_metadata?.name === 'string' ? data.user.user_metadata.name : undefined,
    },
  };
}
