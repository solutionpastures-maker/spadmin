import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Announcement } from '../types';
import { adminFetch } from '@/lib/admin-api';

export const announcementKeys = {
  all: ['announcements'] as const,
  lists: () => [...announcementKeys.all, 'list'] as const,
  list: (filters: string) => [...announcementKeys.lists(), { filters }] as const,
  details: () => [...announcementKeys.all, 'detail'] as const,
  detail: (id: string) => [...announcementKeys.details(), id] as const,
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await adminFetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function useAnnouncements() {
  return useQuery({
    queryKey: announcementKeys.lists(),
    queryFn: () => fetchJson<Announcement[]>('/api/announcements'),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useAnnouncementById(id: string) {
  return useQuery({
    queryKey: announcementKeys.detail(id),
    queryFn: () => fetchJson<Announcement>(`/api/announcements/${id}`),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { title: string; body: string; scheduled_at: string; pinned?: boolean }) =>
      fetchJson('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<{ title: string; body: string; scheduled_at: string; pinned: boolean }> }) =>
      fetchJson(`/api/announcements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: announcementKeys.detail(variables.id) });
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/announcements/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
    },
  });
}
