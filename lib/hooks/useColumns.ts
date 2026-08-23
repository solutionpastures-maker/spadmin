import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnArticle } from '@/lib/types';
import { adminFetch } from '@/lib/admin-api';

export const columnKeys = {
  all: ['columns'] as const,
  lists: () => [...columnKeys.all, 'list'] as const,
  details: () => [...columnKeys.all, 'detail'] as const,
  detail: (id: string) => [...columnKeys.details(), id] as const,
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await adminFetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function useColumnArticles() {
  return useQuery({
    queryKey: columnKeys.lists(),
    queryFn: () => fetchJson<ColumnArticle[]>('/api/columns'),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCreateColumnArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      slug: string;
      title: string;
      author: string;
      author_bio?: string;
      author_image?: string;
      published_at: string;
      read_time: string;
      category: string;
      excerpt: string;
      content: string;
      image_url?: string;
      featured?: boolean;
    }) =>
      fetchJson('/api/columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: columnKeys.lists() });
    },
  });
}

export function useDeleteColumnArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchJson(`/api/columns/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: columnKeys.all });
    },
  });
}

export function useColumnArticleById(id: string) {
  return useQuery({
    queryKey: columnKeys.detail(id),
    queryFn: () => fetchJson<ColumnArticle>(`/api/columns/${id}`),
    enabled: !!id,
  });
}

export function useUpdateColumnArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<{
        slug: string;
        title: string;
        author: string;
        author_bio: string;
        author_image: string;
        published_at: string;
        read_time: string;
        category: string;
        excerpt: string;
        content: string;
        image_url: string;
        featured: boolean;
      }>;
    }) =>
      fetchJson(`/api/columns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: columnKeys.all });
      queryClient.invalidateQueries({ queryKey: columnKeys.detail(variables.id) });
    },
  });
}
