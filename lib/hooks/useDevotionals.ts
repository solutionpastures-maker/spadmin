import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Devotional } from '@/lib/types';
import { adminFetch } from '@/lib/admin-api';

export const devotionalKeys = {
  all: ['devotionals'] as const,
  lists: () => [...devotionalKeys.all, 'list'] as const,
  list: (filters: string) => [...devotionalKeys.lists(), { filters }] as const,
  details: () => [...devotionalKeys.all, 'detail'] as const,
  detail: (id: string) => [...devotionalKeys.details(), id] as const,
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await adminFetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function useDevotionals() {
  return useQuery({
    queryKey: devotionalKeys.lists(),
    queryFn: () => fetchJson<Devotional[]>('/api/devotionals'),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useDevotionalById(id: string) {
  return useQuery({
    queryKey: devotionalKeys.detail(id),
    queryFn: () => fetchJson(`/api/devotionals/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateDevotional() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      content: string;
      verse?: string;
      author?: string;
      published_at: string;
      image_url?: string;
    }) =>
      fetchJson('/api/devotionals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: devotionalKeys.lists() });
    },
  });
}

export function useUpdateDevotional() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: {
      id: string;
      updates: Partial<{
        title: string;
        content: string;
        verse: string;
        author: string;
        published_at: string;
        image_url: string;
      }>;
    }) =>
      fetchJson(`/api/devotionals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: devotionalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: devotionalKeys.detail(variables.id) });
    },
  });
}

export function useDeleteDevotional() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/devotionals/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: devotionalKeys.all });
    },
  });
}
