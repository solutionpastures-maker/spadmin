import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Comment } from '@/lib/types';
import { adminFetch } from '@/lib/admin-api';

export const commentKeys = {
  all: ['comments'] as const,
  lists: () => [...commentKeys.all, 'list'] as const,
  list: (episodeId?: string) => [...commentKeys.lists(), episodeId] as const,
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await adminFetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function useComments(episodeId?: string) {
  const url = episodeId
    ? `/api/comments?episodeId=${encodeURIComponent(episodeId)}`
    : '/api/comments';

  return useQuery({
    queryKey: commentKeys.list(episodeId),
    queryFn: () => fetchJson<Comment[]>(url),
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useUpdateCommentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'visible' | 'flagged' | 'removed' }) =>
      fetchJson(`/api/comments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.all });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/api/comments/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.all });
    },
  });
}
