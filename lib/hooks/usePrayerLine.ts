import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ModerationStatus, PrayerLineComment, PrayerLineConfig, PrayerRequest } from '@/lib/types';
import { adminFetch } from '@/lib/admin-api';

export const prayerLineKeys = {
  all: ['prayer-line'] as const,
  configs: () => [...prayerLineKeys.all, 'configs'] as const,
  config: (id: string) => [...prayerLineKeys.configs(), id] as const,
  requests: () => [...prayerLineKeys.all, 'requests'] as const,
  comments: () => [...prayerLineKeys.all, 'comments'] as const,
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await adminFetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function usePrayerLineConfigs() {
  return useQuery({
    queryKey: prayerLineKeys.configs(),
    queryFn: () => fetchJson<PrayerLineConfig[]>('/api/prayer-line/config'),
    staleTime: 1 * 60 * 1000,
  });
}

export function usePrayerLineConfig(id: string) {
  return useQuery({
    queryKey: prayerLineKeys.config(id),
    queryFn: () => fetchJson<PrayerLineConfig>(`/api/prayer-line/config/${id}`),
    enabled: !!id,
  });
}

export function useCreatePrayerLineConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      google_meet_url: string;
      session_starts_at: string;
      design_image_url?: string;
      is_active?: boolean;
    }) =>
      fetchJson('/api/prayer-line/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: prayerLineKeys.configs() });
    },
  });
}

export function useUpdatePrayerLineConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<{
        title: string;
        description: string;
        google_meet_url: string;
        session_starts_at: string;
        design_image_url: string;
        is_active: boolean;
      }>;
    }) =>
      fetchJson(`/api/prayer-line/config/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: prayerLineKeys.configs() });
      queryClient.invalidateQueries({ queryKey: prayerLineKeys.config(variables.id) });
    },
  });
}

export function useDeletePrayerLineConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchJson(`/api/prayer-line/config/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: prayerLineKeys.configs() });
    },
  });
}

export function usePrayerRequests() {
  return useQuery({
    queryKey: prayerLineKeys.requests(),
    queryFn: () => fetchJson<PrayerRequest[]>('/api/prayer-line/requests'),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useUpdatePrayerRequestStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ModerationStatus }) =>
      fetchJson(`/api/prayer-line/requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: prayerLineKeys.requests() });
    },
  });
}

export function useDeletePrayerRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchJson(`/api/prayer-line/requests/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: prayerLineKeys.requests() });
    },
  });
}

export function usePrayerLineComments() {
  return useQuery({
    queryKey: prayerLineKeys.comments(),
    queryFn: () => fetchJson<PrayerLineComment[]>('/api/prayer-line/comments'),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useUpdatePrayerLineCommentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ModerationStatus }) =>
      fetchJson(`/api/prayer-line/comments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: prayerLineKeys.comments() });
    },
  });
}

export function useDeletePrayerLineComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchJson(`/api/prayer-line/comments/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: prayerLineKeys.comments() });
    },
  });
}
