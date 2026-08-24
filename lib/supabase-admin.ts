/**
 * Supabase Admin Client
 * Use this for admin operations (create, update, delete)
 * Uses service role key - SERVER-SIDE ONLY!
 * 
 * ⚠️ NEVER expose the service role key to the client!
 */

import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AboutContent, FooterContent, WebsiteContentRow, InboxStatus, ContactMessageRow, NewsletterSubscriberRow, VisitRequestRow, EventRegistrationRow } from '@/lib/types';
import type { AnnouncementRow, DevotionalRow, SeriesRow, UserProfileRow } from './supabase-rows';
import {
  applyKnownDevotionalColumns,
  parseNotNullColumn,
  toIsoDate,
  valueForRequiredColumn,
} from './devotional-payload';

let supabaseAdminInstance: SupabaseClient | null = null;

/** Lazy admin client — avoids crashing `next build` when env vars are not set yet. */
export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdminInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error(
        'Missing Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)'
      );
    }
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseAdminInstance;
}

// ============================================
// SERIES FUNCTIONS
// ============================================

export const createSeries = async (seriesData: {
  title: string;
  description?: string;
  image_url?: string;
  tags?: string[];
}) => {
  const { data, error } = await getSupabaseAdmin()
    .from('series')
    .insert(seriesData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateSeries = async (id: string, updates: Partial<{
  title: string;
  description: string;
  image_url: string;
  tags: string[];
}>) => {
  const { data, error } = await getSupabaseAdmin()
    .from('series')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteSeries = async (id: string) => {
  const { error } = await getSupabaseAdmin()
    .from('series')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const getSeries = async () => {
  const { data, error } = await getSupabaseAdmin()
    .from('series')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  // Transform to match Series type
  return data.map((s: SeriesRow) => ({
    id: s.id,
    title: s.title,
    description: s.description || '',
    imageUrl: s.image_url,
    tags: s.tags || [],
    createdAt: new Date(s.created_at),
  }));
};

export const getSeriesById = async (id: string) => {
  const { data, error } = await getSupabaseAdmin()
    .from('series')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

// ============================================
// EPISODES FUNCTIONS
// ============================================

export const createEpisode = async (episodeData: {
  series_id: string;
  title: string;
  description?: string;
  speaker: string;
  published_at: string; // ISO timestamp
  image_url?: string;
  transcript_url?: string;
  parts: Array<{ title: string; fileId: string; duration: number }>;
  chapters?: Array<{ title: string; start: number }>;
}) => {
  const { data, error } = await getSupabaseAdmin()
    .from('episodes')
    .insert(episodeData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateEpisode = async (id: string, updates: Partial<{
  title: string;
  description: string;
  speaker: string;
  published_at: string;
  image_url: string;
  transcript_url: string;
  parts: Array<{ title: string; fileId: string; duration: number }>;
  chapters: Array<{ title: string; start: number }>;
}>) => {
  const { data, error } = await getSupabaseAdmin()
    .from('episodes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteEpisode = async (id: string) => {
  const { error } = await getSupabaseAdmin()
    .from('episodes')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const getEpisodes = async (seriesId?: string) => {
  let query = getSupabaseAdmin()
    .from('episodes')
    .select('*')
    .order('published_at', { ascending: false });
  
  if (seriesId) {
    query = query.eq('series_id', seriesId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
};

export const getEpisodeById = async (id: string) => {
  const { data, error } = await getSupabaseAdmin()
    .from('episodes')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

// ============================================
// ANNOUNCEMENTS FUNCTIONS
// ============================================

export const getAnnouncements = async () => {
  const { data, error } = await getSupabaseAdmin()
    .from('announcements')
    .select('*')
    .order('scheduled_at', { ascending: false });
  
  if (error) throw error;
  
  return data.map((a: AnnouncementRow) => mapAnnouncementRow(a));
};

export const getAnnouncementById = async (id: string) => {
  const { data, error } = await getSupabaseAdmin()
    .from('announcements')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  
  return mapAnnouncementRow(data);
};

function mapAnnouncementRow(a: AnnouncementRow & Record<string, unknown>) {
  const days = Array.isArray(a.days) ? a.days : [];
  return {
    id: a.id,
    title: a.title,
    body: a.body,
    scheduledAt: toIsoDate(a.scheduled_at),
    pinned: a.pinned || false,
    type: (a.type === 'weekly' ? 'weekly' : 'special') as 'special' | 'weekly',
    weekStart: a.week_start || null,
    days: days.map((d: Record<string, unknown>) => ({
      day: d.day as string,
      text: String(d.text || ''),
      startsAt: (d.startsAt as string) || null,
      location: (d.location as string) || null,
    })),
  };
}

export const createAnnouncement = async (announcementData: {
  title: string;
  body: string;
  scheduled_at: string;
  pinned?: boolean;
  type?: 'special' | 'weekly';
  week_start?: string | null;
  days?: Array<{
    day: string;
    text: string;
    startsAt?: string | null;
    location?: string | null;
  }>;
}) => {
  const payload: Record<string, unknown> = {
    title: announcementData.title,
    body: announcementData.body,
    scheduled_at: announcementData.scheduled_at,
    pinned: announcementData.pinned ?? false,
  };
  if (announcementData.type) payload.type = announcementData.type;
  if (announcementData.week_start !== undefined) payload.week_start = announcementData.week_start;
  if (announcementData.days !== undefined) payload.days = announcementData.days;

  const { data, error } = await getSupabaseAdmin()
    .from('announcements')
    .insert(payload)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateAnnouncement = async (
  id: string,
  updates: Partial<{
    title: string;
    body: string;
    scheduled_at: string;
    pinned: boolean;
    type: 'special' | 'weekly';
    week_start: string | null;
    days: Array<{
      day: string;
      text: string;
      startsAt?: string | null;
      location?: string | null;
    }>;
  }>
) => {
  const { data, error } = await getSupabaseAdmin()
    .from('announcements')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteAnnouncement = async (id: string) => {
  // Hub rows keep announcementId in JSON — remove orphans even without the SQL trigger.
  const { data: related } = await getSupabaseAdmin()
    .from('notifications')
    .select('id, data');
  const orphanIds = (related || [])
    .filter((row) => {
      const payload = row.data as { announcementId?: string } | null;
      return payload?.announcementId === id;
    })
    .map((row) => row.id as string);
  if (orphanIds.length) {
    await getSupabaseAdmin().from('notifications').delete().in('id', orphanIds);
  }

  const { error } = await getSupabaseAdmin()
    .from('announcements')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// ============================================
// DEVOTIONALS FUNCTIONS
// ============================================

function mapDevotionalRow(d: DevotionalRow & Record<string, unknown>) {
  return {
    id: d.id,
    title: d.title,
    content: d.content,
    verse: d.verse || d.verse_reference || '',
    verseText: d.verse_text || '',
    author: d.author,
    publishedAt: toIsoDate(d.published_at || d.date || d.created_at),
    imageUrl: d.image_url,
  };
}

export const getDevotionals = async () => {
  const { data, error } = await getSupabaseAdmin()
    .from('devotionals')
    .select('*')
    .order('published_at', { ascending: false });
  
  if (error) {
    const fallback = await getSupabaseAdmin()
      .from('devotionals')
      .select('*')
      .order('date', { ascending: false });
    if (fallback.error) throw error;
    return (fallback.data || []).map((d: DevotionalRow) => mapDevotionalRow(d));
  }
  
  return (data || []).map((d: DevotionalRow) => mapDevotionalRow(d));
};

export const getDevotionalById = async (id: string) => {
  const { data, error } = await getSupabaseAdmin()
    .from('devotionals')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return mapDevotionalRow(data);
};

async function listExistingColumns(table: string): Promise<string[]> {
  const { data } = await getSupabaseAdmin().from(table).select('*').limit(1);
  return data?.[0] ? Object.keys(data[0]) : [];
}

async function writeDevotional(
  action: 'insert' | 'update',
  payload: Record<string, unknown>,
  id?: string
) {
  const canonical = new Set([
    'title',
    'content',
    'verse',
    'author',
    'published_at',
    'image_url',
  ]);
  const existing = await listExistingColumns('devotionals');
  const allowed = new Set(existing.length ? existing : canonical);

  let source = { ...payload };
  if (existing.length) {
    source = applyKnownDevotionalColumns(source, existing);
  }

  for (let attempt = 0; attempt < 12; attempt++) {
    const row = Object.fromEntries(
      Object.entries(source).filter(([key]) => allowed.has(key))
    );
    const query =
      action === 'insert'
        ? getSupabaseAdmin().from('devotionals').insert(row)
        : getSupabaseAdmin().from('devotionals').update(row).eq('id', id!);

    const { data, error } = await query.select().single();
    if (!error) return data;

    const missing = parseNotNullColumn(error.message || '');
    if (!missing) throw error;
    allowed.add(missing);
    source = {
      ...source,
      [missing]: valueForRequiredColumn(missing, source),
    };
  }

  throw new Error('Could not save devotional after filling required columns');
}

export const createDevotional = async (devotionalData: {
  title: string;
  content: string;
  verse?: string;
  verse_text?: string;
  author?: string;
  published_at: string;
  image_url?: string;
}) => {
  const published_at = devotionalData.published_at || new Date().toISOString();
  return writeDevotional('insert', {
    title: devotionalData.title,
    content: devotionalData.content,
    verse: devotionalData.verse || '',
    verse_text: devotionalData.verse_text || '',
    author: devotionalData.author || '',
    published_at,
    image_url: devotionalData.image_url || null,
  });
};

export const updateDevotional = async (id: string, updates: Partial<{
  title: string;
  content: string;
  verse: string;
  verse_text: string;
  author: string;
  published_at: string;
  image_url: string;
}>) => {
  return writeDevotional('update', { ...updates }, id);
};

export const deleteDevotional = async (id: string) => {
  const { error } = await getSupabaseAdmin()
    .from('devotionals')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// ============================================
// GALLERY ALBUMS FUNCTIONS
// ============================================

type GalleryImageRow = {
  id: string;
  url: string;
  caption?: string;
};

type GalleryAlbumRow = {
  id: string;
  slug: string;
  title: string;
  event_date: string;
  cover_image?: string | null;
  image_count?: number | null;
  images?: unknown;
};

type TestimonyRow = {
  id: string;
  slug: string;
  name: string;
  story: string;
  excerpt?: string | null;
  image_url?: string | null;
  video_url?: string | null;
  category?: string | null;
  testimony_date: string;
  featured?: boolean | null;
};

type ColumnArticleRow = {
  id: string;
  slug: string;
  title: string;
  author: string;
  author_bio?: string | null;
  author_image?: string | null;
  published_at: string;
  read_time?: string | null;
  category?: string | null;
  excerpt?: string | null;
  content: string;
  image_url?: string | null;
  featured?: boolean | null;
};

const parseGalleryImages = (value: unknown): GalleryImageRow[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as Record<string, unknown>;
      if (typeof row.url !== 'string' || !row.url.trim()) return null;
      return {
        id: typeof row.id === 'string' && row.id.trim() ? row.id : crypto.randomUUID(),
        url: row.url,
        caption: typeof row.caption === 'string' ? row.caption : undefined,
      };
    })
    .filter(Boolean) as GalleryImageRow[];
};

export const getGalleryAlbums = async () => {
  const { data, error } = await getSupabaseAdmin()
    .from('gallery_albums')
    .select('*')
    .order('event_date', { ascending: false });

  if (error) throw error;

  return ((data || []) as GalleryAlbumRow[]).map((album) => {
    const images = parseGalleryImages(album.images);
    return {
      id: album.id,
      slug: album.slug,
      title: album.title,
      date: new Date(album.event_date),
      coverImage: album.cover_image || images[0]?.url || '',
      imageCount: typeof album.image_count === 'number' ? album.image_count : images.length,
      images,
    };
  });
};

export const getGalleryAlbumById = async (id: string) => {
  const { data, error } = await getSupabaseAdmin()
    .from('gallery_albums')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  const images = parseGalleryImages(data.images);
  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    date: new Date(data.event_date),
    coverImage: data.cover_image || images[0]?.url || '',
    imageCount: typeof data.image_count === 'number' ? data.image_count : images.length,
    images,
  };
};

export const createGalleryAlbum = async (galleryData: {
  slug: string;
  title: string;
  event_date: string;
  cover_image?: string;
  category?: string;
  images: GalleryImageRow[];
}) => {
  const images = parseGalleryImages(galleryData.images);
  const payload = {
    ...galleryData,
    images,
    image_count: images.length,
    cover_image: galleryData.cover_image || images[0]?.url || '',
  };

  const { data, error } = await getSupabaseAdmin()
    .from('gallery_albums')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateGalleryAlbum = async (
  id: string,
  updates: Partial<{
    slug: string;
    title: string;
    event_date: string;
    cover_image: string;
    images: GalleryImageRow[];
  }>
) => {
  const nextUpdates: Record<string, unknown> = { ...updates };
  if (updates.images) {
    const images = parseGalleryImages(updates.images);
    nextUpdates.images = images;
    nextUpdates.image_count = images.length;
    if (!updates.cover_image) {
      nextUpdates.cover_image = images[0]?.url || '';
    }
  }

  const { data, error } = await getSupabaseAdmin()
    .from('gallery_albums')
    .update(nextUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteGalleryAlbum = async (id: string) => {
  const { error } = await getSupabaseAdmin()
    .from('gallery_albums')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// ============================================
// TESTIMONIES FUNCTIONS
// ============================================

export const getTestimonies = async () => {
  const { data, error } = await getSupabaseAdmin()
    .from('testimonies')
    .select('*')
    .order('testimony_date', { ascending: false });

  if (error) throw error;

  return ((data || []) as TestimonyRow[]).map((testimony) => ({
    id: testimony.id,
    slug: testimony.slug,
    name: testimony.name,
    story: testimony.story,
    excerpt: testimony.excerpt || '',
    image: testimony.image_url || undefined,
    videoUrl: testimony.video_url || undefined,
    category: testimony.category || '',
    date: new Date(testimony.testimony_date),
    featured: testimony.featured || false,
  }));
};

export const getTestimonyById = async (id: string) => {
  const { data, error } = await getSupabaseAdmin()
    .from('testimonies')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    story: data.story,
    excerpt: data.excerpt || '',
    image: data.image_url || undefined,
    videoUrl: data.video_url || undefined,
    category: data.category || '',
    date: new Date(data.testimony_date),
    featured: data.featured || false,
  };
};

export const createTestimony = async (testimonyData: {
  slug: string;
  name: string;
  story: string;
  excerpt?: string;
  image_url?: string;
  video_url?: string;
  category?: string;
  testimony_date: string;
  featured?: boolean;
}) => {
  const { data, error } = await getSupabaseAdmin()
    .from('testimonies')
    .insert(testimonyData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateTestimony = async (
  id: string,
  updates: Partial<{
    slug: string;
    name: string;
    story: string;
    excerpt: string;
    image_url: string;
    video_url: string;
    category: string;
    testimony_date: string;
    featured: boolean;
  }>
) => {
  const { data, error } = await getSupabaseAdmin()
    .from('testimonies')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteTestimony = async (id: string) => {
  const { error } = await getSupabaseAdmin()
    .from('testimonies')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// ============================================
// COLUMN ARTICLES FUNCTIONS
// ============================================

export const getColumnArticles = async () => {
  const { data, error } = await getSupabaseAdmin()
    .from('column_articles')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) throw error;

  return ((data || []) as ColumnArticleRow[]).map((article) => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    author: article.author,
    authorBio: article.author_bio || '',
    authorImage: article.author_image || '',
    date: new Date(article.published_at),
    readTime: article.read_time || '',
    category: article.category || '',
    excerpt: article.excerpt || '',
    content: article.content,
    image: article.image_url || '',
    featured: article.featured || false,
  }));
};

export const getColumnArticleById = async (id: string) => {
  const { data, error } = await getSupabaseAdmin()
    .from('column_articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    author: data.author,
    authorBio: data.author_bio || '',
    authorImage: data.author_image || '',
    date: new Date(data.published_at),
    readTime: data.read_time || '',
    category: data.category || '',
    excerpt: data.excerpt || '',
    content: data.content,
    image: data.image_url || '',
    featured: data.featured || false,
  };
};

export const createColumnArticle = async (articleData: {
  slug: string;
  title: string;
  author: string;
  author_bio?: string;
  author_image?: string;
  published_at: string;
  read_time: string;
  category: string;
  excerpt: string;
  content: string;
  image_url?: string;
  featured?: boolean;
}) => {
  const { data, error } = await getSupabaseAdmin()
    .from('column_articles')
    .insert(articleData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateColumnArticle = async (
  id: string,
  updates: Partial<{
    slug: string;
    title: string;
    author: string;
    author_bio: string;
    author_image: string;
    published_at: string;
    read_time: string;
    category: string;
    excerpt: string;
    content: string;
    image_url: string;
    featured: boolean;
  }>
) => {
  const { data, error } = await getSupabaseAdmin()
    .from('column_articles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteColumnArticle = async (id: string) => {
  const { error } = await getSupabaseAdmin()
    .from('column_articles')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// ============================================
// EVENTS FUNCTIONS
// ============================================

type EventRow = {
  id: string;
  slug: string;
  title: string;
  event_date: string;
  time_text?: string | null;
  location?: string | null;
  description?: string | null;
  image_url?: string | null;
  registration_required?: boolean | null;
  category?: string | null;
};

export const getEvents = async () => {
  const { data, error } = await getSupabaseAdmin()
    .from('events')
    .select('*')
    .order('event_date', { ascending: false });

  if (error) throw error;

  return ((data || []) as EventRow[]).map((event) => ({
    id: event.id,
    slug: event.slug,
    title: event.title,
    eventDate: new Date(event.event_date),
    timeText: event.time_text || undefined,
    location: event.location || undefined,
    description: event.description || undefined,
    imageUrl: event.image_url || undefined,
    registrationRequired: event.registration_required || false,
    category: event.category || undefined,
  }));
};

export const getEventById = async (id: string) => {
  const { data, error } = await getSupabaseAdmin()
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    eventDate: new Date(data.event_date),
    timeText: data.time_text || undefined,
    location: data.location || undefined,
    description: data.description || undefined,
    imageUrl: data.image_url || undefined,
    registrationRequired: data.registration_required || false,
    category: data.category || undefined,
  };
};

export const createEvent = async (eventData: {
  slug: string;
  title: string;
  event_date: string;
  time_text?: string;
  location?: string;
  description?: string;
  image_url?: string;
  registration_required?: boolean;
  category?: string;
}) => {
  const { data, error } = await getSupabaseAdmin()
    .from('events')
    .insert(eventData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateEvent = async (
  id: string,
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
  }>
) => {
  const { data, error } = await getSupabaseAdmin()
    .from('events')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteEvent = async (id: string) => {
  const { error } = await getSupabaseAdmin()
    .from('events')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// ============================================
// BIBLE STUDY TOPICS FUNCTIONS
// ============================================

type BibleStudyLessonRow = {
  id: string;
  title: string;
  content?: string;
  readTime?: string;
  scriptureRefs?: string[];
};

type BibleStudyTopicRow = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  verse_reference?: string | null;
  category?: string | null;
  lessons?: unknown;
};

const parseBibleStudyLessons = (value: unknown): BibleStudyLessonRow[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as Record<string, unknown>;
      if (typeof row.title !== 'string' || !row.title.trim()) return null;

      const legacyContent = typeof row.description === 'string' ? row.description : undefined;
      const legacyReadTime = typeof row.duration === 'string' ? row.duration : undefined;
      const content =
        typeof row.content === 'string' ? row.content : legacyContent;
      const readTime =
        typeof row.readTime === 'string' ? row.readTime : legacyReadTime;

      let scriptureRefs: string[] | undefined;
      if (Array.isArray(row.scriptureRefs)) {
        scriptureRefs = row.scriptureRefs.filter((r): r is string => typeof r === 'string');
      }

      return {
        id: typeof row.id === 'string' && row.id.trim() ? row.id : crypto.randomUUID(),
        title: row.title,
        content: content || undefined,
        readTime: readTime || undefined,
        scriptureRefs: scriptureRefs?.length ? scriptureRefs : undefined,
      };
    })
    .filter(Boolean) as BibleStudyLessonRow[];
};

export const getBibleStudyTopics = async () => {
  const { data, error } = await getSupabaseAdmin()
    .from('bible_study_topics')
    .select('*')
    .order('title', { ascending: true });

  if (error) throw error;

  return ((data || []) as BibleStudyTopicRow[]).map((topic) => ({
    id: topic.id,
    slug: topic.slug,
    title: topic.title,
    description: topic.description || undefined,
    verseReference: topic.verse_reference || undefined,
    category: topic.category || undefined,
    lessons: parseBibleStudyLessons(topic.lessons),
  }));
};

export const getBibleStudyTopicById = async (id: string) => {
  const { data, error } = await getSupabaseAdmin()
    .from('bible_study_topics')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    description: data.description || undefined,
    verseReference: data.verse_reference || undefined,
    category: data.category || undefined,
    lessons: parseBibleStudyLessons(data.lessons),
  };
};

export const createBibleStudyTopic = async (topicData: {
  slug: string;
  title: string;
  description?: string;
  verse_reference?: string;
  category?: string;
  lessons: BibleStudyLessonRow[];
}) => {
  const payload = {
    ...topicData,
    lessons: parseBibleStudyLessons(topicData.lessons),
  };

  const { data, error } = await getSupabaseAdmin()
    .from('bible_study_topics')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateBibleStudyTopic = async (
  id: string,
  updates: Partial<{
    slug: string;
    title: string;
    description: string;
    verse_reference: string;
    category: string;
    lessons: BibleStudyLessonRow[];
  }>
) => {
  const nextUpdates: Record<string, unknown> = { ...updates };
  if (updates.lessons) {
    nextUpdates.lessons = parseBibleStudyLessons(updates.lessons);
  }

  const { data, error } = await getSupabaseAdmin()
    .from('bible_study_topics')
    .update(nextUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteBibleStudyTopic = async (id: string) => {
  const { error } = await getSupabaseAdmin()
    .from('bible_study_topics')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// ============================================
// SMALL GROUPS FUNCTIONS
// ============================================

type SmallGroupRow = {
  id: string;
  name: string;
  description?: string | null;
  leader?: string | null;
  category?: string | null;
  meeting_day?: string | null;
  meeting_time?: string | null;
  location?: string | null;
};

export const getSmallGroups = async () => {
  const { data, error } = await getSupabaseAdmin()
    .from('small_groups')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;

  return ((data || []) as SmallGroupRow[]).map((group) => ({
    id: group.id,
    name: group.name,
    description: group.description || undefined,
    leader: group.leader || undefined,
    category: group.category || undefined,
    meetingDay: group.meeting_day || undefined,
    meetingTime: group.meeting_time || undefined,
    location: group.location || undefined,
  }));
};

export const getSmallGroupById = async (id: string) => {
  const { data, error } = await getSupabaseAdmin()
    .from('small_groups')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.name,
    description: data.description || undefined,
    leader: data.leader || undefined,
    category: data.category || undefined,
    meetingDay: data.meeting_day || undefined,
    meetingTime: data.meeting_time || undefined,
    location: data.location || undefined,
  };
};

export const createSmallGroup = async (groupData: {
  name: string;
  description?: string;
  leader?: string;
  category?: string;
  meeting_day?: string;
  meeting_time?: string;
  location?: string;
}) => {
  const { data, error } = await getSupabaseAdmin()
    .from('small_groups')
    .insert(groupData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateSmallGroup = async (
  id: string,
  updates: Partial<{
    name: string;
    description: string;
    leader: string;
    category: string;
    meeting_day: string;
    meeting_time: string;
    location: string;
  }>
) => {
  const { data, error } = await getSupabaseAdmin()
    .from('small_groups')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteSmallGroup = async (id: string) => {
  const { error } = await getSupabaseAdmin()
    .from('small_groups')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// ============================================
// USER PROFILES FUNCTIONS
// ============================================

export const getUserProfiles = async () => {
  const { data, error } = await getSupabaseAdmin()
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return data.map((u: UserProfileRow) => ({
    id: u.id,
    firebaseUid: u.firebase_uid,
    name: u.name,
    email: u.email,
    avatar: u.avatar,
    role: u.role || 'user',
    prefs: u.prefs || { notifications: true, downloadQuality: 'medium' },
    createdAt: new Date(u.created_at),
  }));
};

export const getUserProfileById = async (id: string) => {
  const { data, error } = await getSupabaseAdmin()
    .from('user_profiles')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    firebaseUid: data.firebase_uid,
    name: data.name,
    email: data.email,
    avatar: data.avatar,
    role: data.role || 'user',
    prefs: data.prefs || { notifications: true, downloadQuality: 'medium' },
    createdAt: new Date(data.created_at),
  };
};

export const getUserProfileByFirebaseUid = async (firebaseUid: string) => {
  const { data, error } = await getSupabaseAdmin()
    .from('user_profiles')
    .select('*')
    .eq('firebase_uid', firebaseUid)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return mapUserProfile(data);
};

export const getUserProfileByAuthId = async (authUserId: string) => {
  const { data, error } = await getSupabaseAdmin()
    .from('user_profiles')
    .select('*')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapUserProfile(data);
};

function mapUserProfile(data: {
  id: string;
  firebase_uid?: string | null;
  auth_user_id?: string | null;
  name: string;
  email: string;
  avatar?: string | null;
  role?: string | null;
  prefs?: { notifications: boolean; downloadQuality: 'low' | 'medium' | 'high' } | null;
  created_at: string;
}) {
  return {
    id: data.id,
    firebaseUid: data.firebase_uid,
    authUserId: data.auth_user_id,
    name: data.name,
    email: data.email,
    avatar: data.avatar,
    role: data.role || 'user',
    prefs: data.prefs || { notifications: true, downloadQuality: 'medium' },
    createdAt: new Date(data.created_at),
  };
}

export const createUserProfile = async (userData: {
  firebase_uid?: string | null;
  auth_user_id?: string | null;
  name: string;
  email: string;
  avatar?: string;
  role?: 'user' | 'admin';
  prefs?: { notifications: boolean; downloadQuality: 'low' | 'medium' | 'high' };
}) => {
  const { data, error } = await getSupabaseAdmin()
    .from('user_profiles')
    .insert(userData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const upsertAdminProfile = async (input: {
  authUserId: string;
  name: string;
  email: string;
}) => {
  const byAuth = await getUserProfileByAuthId(input.authUserId);
  const { data: byEmail } = await getSupabaseAdmin()
    .from('user_profiles')
    .select('*')
    .ilike('email', input.email)
    .maybeSingle();
  const existing = byAuth || (byEmail ? mapUserProfile(byEmail) : null);

  if (existing) {
    const { data, error } = await getSupabaseAdmin()
      .from('user_profiles')
      .update({
        auth_user_id: input.authUserId,
        name: input.name,
        email: input.email,
        role: 'admin',
      })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  return createUserProfile({
    auth_user_id: input.authUserId,
    name: input.name,
    email: input.email,
    role: 'admin',
  });
};

export const updateUserProfile = async (id: string, updates: Partial<{
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
  prefs: { notifications: boolean; downloadQuality: 'low' | 'medium' | 'high' };
}>) => {
  const { data, error } = await getSupabaseAdmin()
    .from('user_profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateUserRole = async (firebaseUid: string, role: 'user' | 'admin') => {
  const { data, error } = await getSupabaseAdmin()
    .from('user_profiles')
    .update({ role })
    .eq('firebase_uid', firebaseUid)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteUserProfile = async (id: string) => {
  const { error } = await getSupabaseAdmin()
    .from('user_profiles')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// ============================================
// COMMENTS FUNCTIONS (for moderation)
// ============================================

export const getComments = async (episodeId?: string) => {
  let query = getSupabaseAdmin()
    .from('comments')
    .select(`
      *,
      user_profiles:user_id (id, name, email, avatar)
    `)
    .order('created_at', { ascending: false });
  
  if (episodeId) {
    query = query.eq('episode_id', episodeId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
};

export const updateCommentStatus = async (id: string, status: 'visible' | 'flagged' | 'removed') => {
  const { data, error } = await getSupabaseAdmin()
    .from('comments')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteComment = async (id: string) => {
  const { error } = await getSupabaseAdmin()
    .from('comments')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// ============================================
// WEBSITE CONTENT (footer, about, etc.)
// ============================================

export type WebsiteContentSlug = 'footer' | 'about';

export const getWebsiteContent = async <T extends FooterContent | AboutContent>(
  slug: WebsiteContentSlug
): Promise<T | null> => {
  const { data, error } = await getSupabaseAdmin()
    .from('website_content')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as WebsiteContentRow;
  return row.content as T;
};

export const upsertWebsiteContent = async <T extends FooterContent | AboutContent>(
  slug: WebsiteContentSlug,
  content: T
) => {
  const { data, error } = await getSupabaseAdmin()
    .from('website_content')
    .upsert({ slug, content }, { onConflict: 'slug' })
    .select()
    .single();

  if (error) throw error;
  return data as WebsiteContentRow;
};

// ============================================
// PRAYER LINE FUNCTIONS
// ============================================

type PrayerLineConfigRow = {
  id: string;
  title: string;
  description?: string | null;
  google_meet_url: string;
  session_starts_at: string;
  design_image_url?: string | null;
  is_active?: boolean | null;
  created_at?: string;
  updated_at?: string;
};

type PrayerRequestRow = {
  id: string;
  user_id?: string | null;
  firebase_uid: string;
  text: string;
  is_anonymous?: boolean | null;
  status: 'visible' | 'flagged' | 'removed';
  created_at: string;
  user_profiles?: { id: string; name?: string; email?: string; avatar?: string } | null;
};

type PrayerLineCommentRow = {
  id: string;
  user_id?: string | null;
  firebase_uid: string;
  text: string;
  status: 'visible' | 'flagged' | 'removed';
  created_at: string;
  user_profiles?: { id: string; name?: string; email?: string; avatar?: string } | null;
};

const mapPrayerLineConfig = (row: PrayerLineConfigRow) => ({
  id: row.id,
  title: row.title,
  description: row.description || undefined,
  googleMeetUrl: row.google_meet_url,
  sessionStartsAt: new Date(row.session_starts_at),
  designImageUrl: row.design_image_url || undefined,
  isActive: row.is_active ?? true,
  createdAt: row.created_at ? new Date(row.created_at) : undefined,
  updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
});

const mapPrayerRequest = (row: PrayerRequestRow) => ({
  id: row.id,
  userId: row.user_id || undefined,
  firebaseUid: row.firebase_uid,
  text: row.text,
  isAnonymous: row.is_anonymous ?? false,
  status: row.status,
  createdAt: new Date(row.created_at),
  userProfile: row.user_profiles
    ? {
        id: row.user_profiles.id,
        name: row.user_profiles.name,
        email: row.user_profiles.email,
        avatar: row.user_profiles.avatar,
      }
    : null,
});

const mapPrayerLineComment = (row: PrayerLineCommentRow) => ({
  id: row.id,
  userId: row.user_id || undefined,
  firebaseUid: row.firebase_uid,
  text: row.text,
  status: row.status,
  createdAt: new Date(row.created_at),
  userProfile: row.user_profiles
    ? {
        id: row.user_profiles.id,
        name: row.user_profiles.name,
        email: row.user_profiles.email,
        avatar: row.user_profiles.avatar,
      }
    : null,
});

export const getPrayerLineConfigs = async () => {
  const { data, error } = await getSupabaseAdmin()
    .from('prayer_line_config')
    .select('*')
    .order('session_starts_at', { ascending: false });

  if (error) throw error;
  return ((data || []) as PrayerLineConfigRow[]).map(mapPrayerLineConfig);
};

export const getPrayerLineConfigById = async (id: string) => {
  const { data, error } = await getSupabaseAdmin()
    .from('prayer_line_config')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return mapPrayerLineConfig(data as PrayerLineConfigRow);
};

export const createPrayerLineConfig = async (configData: {
  title: string;
  description?: string;
  google_meet_url: string;
  session_starts_at: string;
  design_image_url?: string;
  is_active?: boolean;
}) => {
  if (configData.is_active !== false) {
    await getSupabaseAdmin()
      .from('prayer_line_config')
      .update({ is_active: false })
      .eq('is_active', true);
  }

  const { data, error } = await getSupabaseAdmin()
    .from('prayer_line_config')
    .insert({
      ...configData,
      is_active: configData.is_active ?? true,
    })
    .select()
    .single();

  if (error) throw error;
  return mapPrayerLineConfig(data as PrayerLineConfigRow);
};

export const updatePrayerLineConfig = async (
  id: string,
  updates: Partial<{
    title: string;
    description: string;
    google_meet_url: string;
    session_starts_at: string;
    design_image_url: string;
    is_active: boolean;
  }>
) => {
  if (updates.is_active === true) {
    await getSupabaseAdmin()
      .from('prayer_line_config')
      .update({ is_active: false })
      .eq('is_active', true)
      .neq('id', id);
  }

  const { data, error } = await getSupabaseAdmin()
    .from('prayer_line_config')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapPrayerLineConfig(data as PrayerLineConfigRow);
};

export const deletePrayerLineConfig = async (id: string) => {
  const { error } = await getSupabaseAdmin().from('prayer_line_config').delete().eq('id', id);
  if (error) throw error;
};

export const getPrayerRequests = async () => {
  const { data, error } = await getSupabaseAdmin()
    .from('prayer_requests')
    .select(`
      *,
      user_profiles:user_id (id, name, email, avatar)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data || []) as PrayerRequestRow[]).map(mapPrayerRequest);
};

export const updatePrayerRequestStatus = async (
  id: string,
  status: 'visible' | 'flagged' | 'removed'
) => {
  const { data, error } = await getSupabaseAdmin()
    .from('prayer_requests')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapPrayerRequest(data as PrayerRequestRow);
};

export const deletePrayerRequest = async (id: string) => {
  const { error } = await getSupabaseAdmin().from('prayer_requests').delete().eq('id', id);
  if (error) throw error;
};

export const getPrayerLineComments = async () => {
  const { data, error } = await getSupabaseAdmin()
    .from('prayer_line_comments')
    .select(`
      *,
      user_profiles:user_id (id, name, email, avatar)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data || []) as PrayerLineCommentRow[]).map(mapPrayerLineComment);
};

export const updatePrayerLineCommentStatus = async (
  id: string,
  status: 'visible' | 'flagged' | 'removed'
) => {
  const { data, error } = await getSupabaseAdmin()
    .from('prayer_line_comments')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapPrayerLineComment(data as PrayerLineCommentRow);
};

export const deletePrayerLineComment = async (id: string) => {
  const { error } = await getSupabaseAdmin().from('prayer_line_comments').delete().eq('id', id);
  if (error) throw error;
};

// ============================================
// WEBSITE INBOX (contact, newsletter, visits)
// ============================================

export type { InboxStatus, ContactMessageRow, NewsletterSubscriberRow, VisitRequestRow, EventRegistrationRow } from '@/lib/types';

export const getContactMessages = async (): Promise<ContactMessageRow[]> => {
  const { data, error } = await getSupabaseAdmin()
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as ContactMessageRow[];
};

export const updateContactMessageStatus = async (id: string, status: InboxStatus) => {
  const { error } = await getSupabaseAdmin()
    .from('contact_messages')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
};

export const getNewsletterSubscribers = async (): Promise<NewsletterSubscriberRow[]> => {
  const { data, error } = await getSupabaseAdmin()
    .from('newsletter_subscribers')
    .select('*')
    .order('subscribed_at', { ascending: false });
  if (error) throw error;
  return (data || []) as NewsletterSubscriberRow[];
};

export const getVisitRequests = async (): Promise<VisitRequestRow[]> => {
  const { data, error } = await getSupabaseAdmin()
    .from('visit_requests')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as VisitRequestRow[];
};

export const updateVisitRequestStatus = async (id: string, status: InboxStatus) => {
  const { error } = await getSupabaseAdmin()
    .from('visit_requests')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
};

export const getEventRegistrations = async (
  eventId?: string
): Promise<EventRegistrationRow[]> => {
  let query = getSupabaseAdmin()
    .from('event_registrations')
    .select('*, events(title, slug)')
    .order('created_at', { ascending: false });

  if (eventId) {
    query = query.eq('event_id', eventId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((row: Record<string, unknown>) => {
    const events = row.events as { title: string; slug: string } | null;
    const { events: _e, ...rest } = row;
    return {
      ...(rest as Omit<EventRegistrationRow, 'event_title' | 'event_slug'>),
      event_title: events?.title,
      event_slug: events?.slug,
    };
  });
};

export const updateEventRegistrationStatus = async (id: string, status: InboxStatus) => {
  const { error } = await getSupabaseAdmin()
    .from('event_registrations')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
};
