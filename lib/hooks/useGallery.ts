import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GalleryAlbum } from '@/lib/types';
import { adminFetch } from '@/lib/admin-api';

export const galleryKeys = {
  all: ['gallery'] as const,
  lists: () => [...galleryKeys.all, 'list'] as const,
  details: () => [...galleryKeys.all, 'detail'] as const,
  detail: (id: string) => [...galleryKeys.details(), id] as const,
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await adminFetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function useGalleryAlbums() {
  return useQuery({
    queryKey: galleryKeys.lists(),
    queryFn: () => fetchJson<GalleryAlbum[]>('/api/gallery'),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCreateGalleryAlbum() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      slug: string;
      title: string;
      event_date: string;
      cover_image?: string;
      category?: string;
      images: Array<{ id: string; url: string; caption?: string }>;
    }) =>
      fetchJson('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.lists() });
    },
  });
}

export function useDeleteGalleryAlbum() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchJson(`/api/gallery/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
    },
  });
}

export function useGalleryAlbumById(id: string) {
  return useQuery({
    queryKey: galleryKeys.detail(id),
    queryFn: () => fetchJson<GalleryAlbum>(`/api/gallery/${id}`),
    enabled: !!id,
  });
}

export function useUpdateGalleryAlbum() {
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
        cover_image: string;
        category: string;
        images: Array<{ id: string; url: string; caption?: string }>;
      }>;
    }) =>
      fetchJson(`/api/gallery/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
      queryClient.invalidateQueries({ queryKey: galleryKeys.detail(variables.id) });
    },
  });
}
