import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Event } from '@/lib/types';
import { adminFetch } from '@/lib/admin-api';

export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await adminFetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function useEvents() {
  return useQuery({
    queryKey: eventKeys.lists(),
    queryFn: () => fetchJson<Event[]>('/api/events'),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      slug: string;
      title: string;
      event_date: string;
      time_text?: string;
      location?: string;
      description?: string;
      image_url?: string;
      registration_required?: boolean;
      category?: string;
    }) =>
      fetchJson('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchJson(`/api/events/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

export function useEventById(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => fetchJson<Event>(`/api/events/${id}`),
    enabled: !!id,
  });
}

export function useUpdateEvent() {
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
        event_date: string;
        time_text: string;
        location: string;
        description: string;
        image_url: string;
        registration_required: boolean;
        category: string;
      }>;
    }) =>
      fetchJson(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.id) });
    },
  });
}
