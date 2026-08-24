'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { onAuthChange, signOutUser } from '@/lib/firebase-utils';
import { adminJson } from '@/lib/admin-api';
import { Header } from '@/components/header';
import { BottomNav } from '@/components/bottom-nav';
import { LoadingScreen } from '@/components/loading-screen';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<{ displayName: string; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (authUser) => {
      if (!authUser) {
        setUser(null);
        setDenied(false);
        setIsLoading(false);
        router.push('/login');
        return;
      }

      try {
        const me = await adminJson<{ name?: string; email?: string; role?: string }>('/api/auth/me');
        if (me.role !== 'admin') {
          setDenied(true);
          setUser(null);
          setIsLoading(false);
          return;
        }
        setDenied(false);
        setUser({
          displayName: me.name || authUser.displayName || 'Admin',
          email: me.email || authUser.email || '',
        });
      } catch {
        setDenied(true);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });
    return unsubscribe;
  }, [router]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setIsRefreshing(false);
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      router.push('/login');
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (denied) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Staff access only</h1>
          <p className="text-muted-foreground mb-4">This account is not an admin.</p>
          <button type="button" className="underline" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        userName={user.displayName}
        userEmail={user.email}
        onRefresh={handleRefresh}
        onSignOut={handleSignOut}
        isRefreshing={isRefreshing}
      />
      <main className="mx-auto max-w-[1280px] px-4 pb-28 pt-8 sm:px-6 sm:pt-10 md:pb-10">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
