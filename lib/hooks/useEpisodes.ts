import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Episode, EpisodePart } from '@/lib/types';
import { adminFetch } from '@/lib/admin-api';

export const episodeKeys = {
  all: ['episodes'] as const,
  lists: () => [...episodeKeys.all, 'list'] as const,
  listBySeries: (seriesId: string) => [...episodeKeys.lists(), seriesId] as const,
  details: () => [...episodeKeys.all, 'detail'] as const,
  detail: (id: string) => [...episodeKeys.details(), id] as const,
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await adminFetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function useEpisodes(seriesId?: string) {
  const url = seriesId
    ? `/api/episodes?seriesId=${encodeURIComponent(seriesId)}`
    : '/api/episodes';

  return useQuery({
    queryKey: seriesId ? episodeKeys.listBySeries(seriesId) : episodeKeys.lists(),
    queryFn: () => fetchJson<Episode[]>(url),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useEpisodeById(id: string) {
  return useQuery({
    queryKey: episodeKeys.detail(id),
    queryFn: () => fetchJson(`/api/episodes/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateEpisode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      series_id: string;
      title: string;
      description?: string;
      speaker: string;
      published_at: string;
      image_url?: string;
      transcript_url?: string;
      parts: EpisodePart[];
      chapters?: Array<{ title: string; start: number }>;
    }) =>
      fetchJson('/api/episodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: episodeKeys.lists() });
    },
  });
}

export function useUpdateEpisode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: {
      id: string;
      updates: Partial<{
        title: string;
        description: string;
        speaker: string;
        published_at: string;
        image_url: string;
        transcript_url: string;
        parts: EpisodePart[];
        chapters: Array<{ title: string; start: number }>;
      }>;
    }) =>
      fetchJson(`/api/episodes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: episodeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: episodeKeys.detail(variables.id) });
    },
  });
}

export function useDeleteEpisode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/episodes/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: episodeKeys.all });
    },
  });
}
