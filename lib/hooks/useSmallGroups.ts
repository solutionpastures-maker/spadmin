import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SmallGroup } from '@/lib/types';
import { adminFetch } from '@/lib/admin-api';

export const smallGroupKeys = {
  all: ['small-groups'] as const,
  lists: () => [...smallGroupKeys.all, 'list'] as const,
  details: () => [...smallGroupKeys.all, 'detail'] as const,
  detail: (id: string) => [...smallGroupKeys.details(), id] as const,
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await adminFetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function useSmallGroups() {
  return useQuery({
    queryKey: smallGroupKeys.lists(),
    queryFn: () => fetchJson<SmallGroup[]>('/api/small-groups'),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCreateSmallGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      leader?: string;
      category?: string;
      meeting_day?: string;
      meeting_time?: string;
      location?: string;
    }) =>
      fetchJson('/api/small-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smallGroupKeys.lists() });
    },
  });
}

export function useDeleteSmallGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchJson(`/api/small-groups/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smallGroupKeys.all });
    },
  });
}

export function useSmallGroupById(id: string) {
  return useQuery({
    queryKey: smallGroupKeys.detail(id),
    queryFn: () => fetchJson<SmallGroup>(`/api/small-groups/${id}`),
    enabled: !!id,
  });
}

export function useUpdateSmallGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<{
        name: string;
        description: string;
        leader: string;
        category: string;
        meeting_day: string;
        meeting_time: string;
        location: string;
      }>;
    }) =>
      fetchJson(`/api/small-groups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: smallGroupKeys.all });
      queryClient.invalidateQueries({ queryKey: smallGroupKeys.detail(variables.id) });
    },
  });
}
