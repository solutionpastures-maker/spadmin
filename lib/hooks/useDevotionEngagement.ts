import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminJson } from '@/lib/admin-api';
import type { DevotionComment, DevotionPrayer, ModerationStatus } from '@/lib/devotion-engagement-store';

export const devotionEngageKeys = {
  all: ['devotion-engagement'] as const,
  comments: () => [...devotionEngageKeys.all, 'comments'] as const,
  prayers: () => [...devotionEngageKeys.all, 'prayers'] as const,
};

export function useDevotionCommentsAdmin() {
  return useQuery({
    queryKey: devotionEngageKeys.comments(),
    queryFn: () => adminJson<DevotionComment[]>('/api/devotion-engagement/comments'),
    staleTime: 30 * 1000,
  });
}

export function useDevotionPrayersAdmin() {
  return useQuery({
    queryKey: devotionEngageKeys.prayers(),
    queryFn: () => adminJson<DevotionPrayer[]>('/api/devotion-engagement/prayers'),
    staleTime: 30 * 1000,
  });
}

export function useUpdateDevotionCommentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ModerationStatus }) =>
      adminJson(`/api/devotion-engagement/comments/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: devotionEngageKeys.comments() }),
  });
}

export function useDeleteDevotionComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminJson(`/api/devotion-engagement/comments/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: devotionEngageKeys.comments() }),
  });
}

export function useUpdateDevotionPrayerStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ModerationStatus }) =>
      adminJson(`/api/devotion-engagement/prayers/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: devotionEngageKeys.prayers() }),
  });
}

export function useDeleteDevotionPrayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminJson(`/api/devotion-engagement/prayers/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: devotionEngageKeys.prayers() }),
  });
}
