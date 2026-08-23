/**
 * Client helpers for admin CMS. All requests send the Supabase Auth bearer token.
 */

import { adminFetch } from '@/lib/admin-api';

// Series functions
export const getSeries = async () => {
  const response = await adminFetch('/api/series');
  if (!response.ok) {
    throw new Error('Failed to fetch series');
  }
  return response.json();
};

export const getSeriesById = async (id: string) => {
  const response = await adminFetch(`/api/series/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch series');
  }
  const data = await response.json();
  // Transform to match Series type
  return {
    id: data.id,
    title: data.title,
    description: data.description || '',
    imageUrl: data.imageUrl,
    scripture: data.scripture,
    tags: data.tags || [],
    createdAt: new Date(data.createdAt),
  };
};

export const createSeries = async (seriesData: {
  title: string;
  description?: string;
  imageUrl?: string;
  scripture?: string[];
  tags?: string[];
}) => {
  const response = await adminFetch('/api/series', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(seriesData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create series');
  }
  return response.json();
};

export const updateSeries = async (id: string, updates: {
  title?: string;
  description?: string;
  imageUrl?: string;
  scripture?: string[];
  tags?: string[];
}) => {
  const response = await adminFetch(`/api/series/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update series');
  }
  return response.json();
};

export const deleteSeries = async (id: string) => {
  const response = await adminFetch(`/api/series/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete series');
  }
  return response.json();
};

// Episode functions
export const getEpisodes = async (seriesId?: string) => {
  const url = seriesId ? `/api/episodes?seriesId=${seriesId}` : '/api/episodes';
  const response = await adminFetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch episodes');
  }
  return response.json();
};

export const getEpisodeById = async (id: string) => {
  const response = await adminFetch(`/api/episodes/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch episode');
  }
  return response.json();
};

export const createEpisode = async (episodeData: {
  series_id: string;
  title: string;
  description?: string;
  speaker: string;
  published_at: string;
  image_url?: string;
  scripture?: string[];
  transcript_url?: string;
  parts: Array<{
    title: string;
    duration: number;
    source?: 'supabase' | 'drive';
    storagePath?: string;
    fileId?: string;
  }>;
  chapters?: Array<{ title: string; start: number }>;
}) => {
  const response = await adminFetch('/api/episodes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(episodeData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create episode');
  }
  return response.json();
};

export const updateEpisode = async (id: string, updates: {
  title?: string;
  description?: string;
  speaker?: string;
  published_at?: string;
  image_url?: string;
  scripture?: string[];
  transcript_url?: string;
  parts?: Array<{
    title: string;
    duration: number;
    source?: 'supabase' | 'drive';
    storagePath?: string;
    fileId?: string;
  }>;
  chapters?: Array<{ title: string; start: number }>;
}) => {
  const response = await adminFetch(`/api/episodes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update episode');
  }
  return response.json();
};

export const deleteEpisode = async (id: string) => {
  const response = await adminFetch(`/api/episodes/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete episode');
  }
  return response.json();
};

