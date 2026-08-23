'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { AppLayoutWrapper } from '@/components/app-layout-wrapper';

export function Providers({ children }: { children: ReactNode }) {
  // Create QueryClient inside component to avoid sharing between requests
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 2,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AppLayoutWrapper>{children}</AppLayoutWrapper>
    </QueryClientProvider>
  );
}

