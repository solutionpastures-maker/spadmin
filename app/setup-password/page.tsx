'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

function SetupPasswordForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await fetch('/api/auth/setup-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      setSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Image
            src="/logo.png"
            alt="Solution Pastures"
            width={72}
            height={72}
            className="h-[72px] w-[72px] object-contain"
            priority
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-foreground">Create your password</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Staff who used the old login still have a church profile. We cannot copy those passwords, so enter the same
          email and we will send a link to set a new one.
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow-lg border border-border sm:rounded-xl sm:px-10">
          {sent ? (
            <p className="text-sm text-muted-foreground">
              If we have a profile for <strong>{email}</strong>, check that inbox for a link.
            </p>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <Button type="submit" variant="gold" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending…' : 'Send setup link'}
              </Button>
            </form>
          )}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/login" className="font-medium text-primary hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SetupPasswordPage() {
  return (
    <Suspense>
      <SetupPasswordForm />
    </Suspense>
  );
}
