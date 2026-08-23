'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Church } from 'lucide-react';
import { signInUser } from '@/lib/firebase-utils';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setNeedsSetup(false);
    try {
      await signInUser(formData.email, formData.password);
      router.push('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in.';
      setError(message);
      setNeedsSetup(/create a password|no password/i.test(message));
    } finally {
      setIsLoading(false);
    }
  };

  const setupHref = formData.email.trim()
    ? `/setup-password?email=${encodeURIComponent(formData.email.trim())}`
    : '/setup-password';

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-lg">
            <Church className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-foreground">Solution Pastures Admin</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">Sign in to manage your church app</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow-lg border border-border sm:rounded-xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}{' '}
                {needsSetup ? (
                  <Link href={setupHref} className="font-medium underline">
                    Create a password
                  </Link>
                ) : null}
              </div>
            ) : null}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">Email</label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="you@church.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">Password</label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                  className="block w-full px-3 py-2 pr-10 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                </button>
              </div>
            </div>
            <Button type="submit" variant="gold" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Used the old login?{' '}
            <Link href={setupHref} className="font-medium text-primary hover:underline">
              Create a password
            </Link>
          </p>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            <Link href="/signup" className="font-medium text-primary hover:underline">Create admin account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
