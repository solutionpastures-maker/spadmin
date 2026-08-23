import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BibleStudyTopic } from '@/lib/types';
import { adminFetch } from '@/lib/admin-api';

export const bibleStudyKeys = {
  all: ['bible-study'] as const,
  lists: () => [...bibleStudyKeys.all, 'list'] as const,
  details: () => [...bibleStudyKeys.all, 'detail'] as const,
  detail: (id: string) => [...bibleStudyKeys.details(), id] as const,
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await adminFetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function useBibleStudyTopics() {
  return useQuery({
    queryKey: bibleStudyKeys.lists(),
    queryFn: () => fetchJson<BibleStudyTopic[]>('/api/bible-study'),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCreateBibleStudyTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      slug: string;
      title: string;
      description?: string;
      verse_reference?: string;
      category?: string;
      lessons: Array<{ id: string; title: string; content?: string; readTime?: string; scriptureRefs?: string[] }>;
    }) =>
      fetchJson('/api/bible-study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bibleStudyKeys.lists() });
    },
  });
}

export function useDeleteBibleStudyTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchJson(`/api/bible-study/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bibleStudyKeys.all });
    },
  });
}

export function useBibleStudyTopicById(id: string) {
  return useQuery({
    queryKey: bibleStudyKeys.detail(id),
    queryFn: () => fetchJson<BibleStudyTopic>(`/api/bible-study/${id}`),
    enabled: !!id,
  });
}

export function useUpdateBibleStudyTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<{
        slug: string;
        title: string;
        description: string;
        verse_reference: string;
        category: string;
        lessons: Array<{
          id: string;
          title: string;
          content?: string;
          readTime?: string;
          scriptureRefs?: string[];
        }>;
      }>;
    }) =>
      fetchJson(`/api/bible-study/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: bibleStudyKeys.all });
      queryClient.invalidateQueries({ queryKey: bibleStudyKeys.detail(variables.id) });
    },
  });
}
