import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminJson } from '@/lib/admin-api';
import type { LiveQuestion, LiveQuestionStatus, LiveService } from '@/lib/live-store';

export const liveKeys = {
  all: ['live'] as const,
  services: () => [...liveKeys.all, 'services'] as const,
  questions: (serviceId?: string) => [...liveKeys.all, 'questions', serviceId || 'all'] as const,
};

export function useLiveServices() {
  return useQuery({
    queryKey: liveKeys.services(),
    queryFn: () => adminJson<LiveService[]>('/api/live/services'),
    staleTime: 15 * 1000,
    refetchInterval: 15 * 1000,
  });
}

export function useCreateLiveService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      adminJson<LiveService>('/api/live/services', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: liveKeys.services() }),
  });
}

export function useUpdateLiveService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Record<string, unknown> }) =>
      adminJson<LiveService>(`/api/live/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: liveKeys.services() }),
  });
}

export function useDeleteLiveService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminJson(`/api/live/services/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: liveKeys.services() }),
  });
}

export function useLiveQuestions(serviceId?: string) {
  return useQuery({
    queryKey: liveKeys.questions(serviceId),
    queryFn: () =>
      adminJson<LiveQuestion[]>(
        serviceId ? `/api/live/questions?service_id=${encodeURIComponent(serviceId)}` : '/api/live/questions'
      ),
    enabled: Boolean(serviceId),
    staleTime: 5 * 1000,
    refetchInterval: 8 * 1000,
  });
}

export function useUpdateLiveQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: LiveQuestionStatus }) =>
      adminJson(`/api/live/questions/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: liveKeys.all }),
  });
}

export function useDeleteLiveQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminJson(`/api/live/questions/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: liveKeys.all }),
  });
}
