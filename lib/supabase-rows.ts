/** Snake_case row shapes returned from Supabase admin queries */

export type SeriesRow = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  scripture?: string[] | null;
  tags: string[] | null;
  created_at: string;
};

export type AnnouncementRow = {
  id: string;
  title: string;
  body: string;
  scheduled_at: string;
  pinned: boolean | null;
  type?: string | null;
  week_start?: string | null;
  days?: unknown;
};

export type DevotionalRow = {
  id: string;
  title: string;
  content: string;
  verse: string | null;
  verse_text?: string | null;
  verse_reference?: string | null;
  author: string | null;
  published_at?: string | null;
  date?: string | null;
  created_at?: string | null;
  image_url: string | null;
};

export type UserProfileRow = {
  id: string;
  firebase_uid: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string | null;
  prefs: Record<string, unknown> | null;
  created_at: string;
};
