import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Series } from '../types';
import { adminFetch } from '@/lib/admin-api';

export const seriesKeys = {
  all: ['series'] as const,
  lists: () => [...seriesKeys.all, 'list'] as const,
  list: (filters: string) => [...seriesKeys.lists(), { filters }] as const,
  details: () => [...seriesKeys.all, 'detail'] as const,
  detail: (id: string) => [...seriesKeys.details(), id] as const,
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await adminFetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function useSeries() {
  return useQuery({
    queryKey: seriesKeys.lists(),
    queryFn: () => fetchJson<Series[]>('/api/series'),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useSeriesById(id: string) {
  return useQuery({
    queryKey: seriesKeys.detail(id),
    queryFn: () => fetchJson<Series>(`/api/series/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateSeries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { title: string; description?: string; image_url?: string; tags?: string[] }) =>
      fetchJson('/api/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seriesKeys.lists() });
    },
  });
}

export function useUpdateSeries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<{ title: string; description: string; imageUrl: string; scripture: string[]; tags: string[] }> }) =>
      fetchJson(`/api/series/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: seriesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: seriesKeys.detail(variables.id) });
    },
  });
}

export function useDeleteSeries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/series/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seriesKeys.all });
    },
  });
}
