import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Testimony } from '@/lib/types';
import { adminFetch } from '@/lib/admin-api';

export const testimonyKeys = {
  all: ['testimonies'] as const,
  lists: () => [...testimonyKeys.all, 'list'] as const,
  details: () => [...testimonyKeys.all, 'detail'] as const,
  detail: (id: string) => [...testimonyKeys.details(), id] as const,
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await adminFetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function useTestimonies() {
  return useQuery({
    queryKey: testimonyKeys.lists(),
    queryFn: () => fetchJson<Testimony[]>('/api/testimonies'),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCreateTestimony() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      slug: string;
      name: string;
      story: string;
      excerpt?: string;
      image_url?: string;
      video_url?: string;
      category?: string;
      testimony_date: string;
      featured?: boolean;
    }) =>
      fetchJson('/api/testimonies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testimonyKeys.lists() });
    },
  });
}

export function useDeleteTestimony() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchJson(`/api/testimonies/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testimonyKeys.all });
    },
  });
}

export function useTestimonyById(id: string) {
  return useQuery({
    queryKey: testimonyKeys.detail(id),
    queryFn: () => fetchJson<Testimony>(`/api/testimonies/${id}`),
    enabled: !!id,
  });
}

export function useUpdateTestimony() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<{
        slug: string;
        name: string;
        story: string;
        excerpt: string;
        image_url: string;
        video_url: string;
        category: string;
        testimony_date: string;
        featured: boolean;
      }>;
    }) =>
      fetchJson(`/api/testimonies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: testimonyKeys.all });
      queryClient.invalidateQueries({ queryKey: testimonyKeys.detail(variables.id) });
    },
  });
}
