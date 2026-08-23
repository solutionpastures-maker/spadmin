import fs from 'fs';
import path from 'path';

const c = path.join(process.cwd(), 'components');
const x = 'div';

function tags(html) {
  let i = 0;
  return html.replace(/<TAG>/g, () => `<${x}`).replace(/<\/TAG>/g, () => `</${x}>`);
}

const loading = tags(`'use client';

export function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <TAG className="min-h-[50vh] flex items-center justify-center">
      <TAG className="text-center">
        <TAG className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto" />
        <p className="mt-4 text-muted-foreground">{message}</p>
      </TAG>
    </TAG>
  );
}
`);

fs.writeFileSync(path.join(c, 'loading-screen.tsx'), loading);

const pageHeader = tags(`'use client';

import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  action?: ReactNode;
  backHref?: string;
}

export function PageHeader({ title, description, icon: Icon, action, backHref }: PageHeaderProps) {
  return (
    <TAG className="mb-8">
      {backHref && (
        <Link href={backHref} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          ← Back
        </Link>
      )}
      <TAG className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <TAG className="flex items-start gap-3">
          <TAG className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon size={24} className="text-primary" />
          </TAG>
          <TAG>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">{title}</h1>
            {description && <p className="text-muted-foreground mt-1">{description}</p>}
          </TAG>
        </TAG>
        {action && <TAG className="shrink-0">{action}</TAG>}
      </TAG>
    </TAG>
  );
}
`);

fs.writeFileSync(path.join(c, 'page-header.tsx'), pageHeader);

const appShell = tags(`'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { onAuthChange } from '@/lib/firebase-utils';
import { signOutUser } from '@/lib/firebase-utils';
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          displayName: firebaseUser.displayName || 'Admin',
          email: firebaseUser.email || '',
        });
      } else {
        setUser(null);
        router.push('/login');
      }
      setIsLoading(false);
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

  if (!user) {
    return null;
  }

  return (
    <TAG className="min-h-screen bg-background">
      <Header
        userName={user.displayName}
        userEmail={user.email}
        onRefresh={handleRefresh}
        onSignOut={handleSignOut}
        isRefreshing={isRefreshing}
      />
      <main className="pt-16 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <BottomNav />
    </TAG>
  );
}
`);

fs.writeFileSync(path.join(c, 'app-shell.tsx'), appShell);

const layoutWrapper = tags(`'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { AppShell } from '@/components/app-shell';

export function AppLayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}
`);

fs.writeFileSync(path.join(c, 'app-layout-wrapper.tsx'), layoutWrapper);

console.log('Done');
