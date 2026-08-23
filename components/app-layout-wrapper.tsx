'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { AppShell } from '@/components/app-shell';

export function AppLayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/setup-password' ||
    pathname === '/set-password';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}
