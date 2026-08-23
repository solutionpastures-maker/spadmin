'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Church } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';

    const applyHashSession = async () => {
      const params = new URLSearchParams(hash.replace(/^#/, ''));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      if (accessToken && refreshToken) {
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      }
      const { data } = await supabase.auth.getSession();
      setReady(Boolean(data.session));
      if (!data.session) {
        setError('This link is missing or expired. Request a new password email.');
      }
    };

    void applyHashSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-lg">
            <Church className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-foreground">Set your password</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          This finishes moving staff sign-in off Firebase. Use this password on admin, the website, and the app.
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow-lg border border-border sm:rounded-xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error ? (
              <p className="text-sm text-destructive">
                {error}{' '}
                <Link href="/setup-password" className="underline">
                  Request a new link
                </Link>
              </p>
            ) : null}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                New password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                disabled={!ready}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-foreground">
                Confirm password
              </label>
              <input
                id="confirm"
                type="password"
                required
                disabled={!ready}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button type="submit" variant="gold" className="w-full" disabled={!ready || saving}>
              {saving ? 'Saving…' : 'Save password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
