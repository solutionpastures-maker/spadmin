import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AboutContent, FooterContent } from '@/lib/types';
import { adminFetch } from '@/lib/admin-api';

export type WebsiteContentSlug = 'footer' | 'about';

export const websiteContentKeys = {
  all: ['website-content'] as const,
  detail: (slug: WebsiteContentSlug) => [...websiteContentKeys.all, slug] as const,
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await adminFetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function useFooterContent() {
  return useQuery({
    queryKey: websiteContentKeys.detail('footer'),
    queryFn: () => fetchJson<FooterContent>('/api/website-content/footer'),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useAboutContent() {
  return useQuery({
    queryKey: websiteContentKeys.detail('about'),
    queryFn: () => fetchJson<AboutContent>('/api/website-content/about'),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useUpdateWebsiteContent(slug: WebsiteContentSlug) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: FooterContent | AboutContent) =>
      fetchJson(`/api/website-content/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: websiteContentKeys.detail(slug) });
    },
  });
}
