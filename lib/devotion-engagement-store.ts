import { getSupabaseAdmin } from '@/lib/supabase-admin';

export type ModerationStatus = 'visible' | 'flagged' | 'removed';

export type DevotionComment = {
  id: string;
  devotionalId: string;
  firebaseUid: string;
  text: string;
  status: ModerationStatus;
  createdAt: string;
  authorName?: string;
  authorEmail?: string;
};

export type DevotionPrayer = {
  id: string;
  devotionalId: string;
  firebaseUid: string;
  text: string;
  isAnonymous: boolean;
  status: ModerationStatus;
  createdAt: string;
  authorName?: string;
  authorEmail?: string;
};

type CommentRow = {
  id: string;
  devotional_id: string;
  firebase_uid: string;
  text: string;
  status: ModerationStatus;
  created_at: string;
  user_profiles?: { name?: string; email?: string } | null;
};

type PrayerRow = {
  id: string;
  devotional_id: string;
  firebase_uid: string;
  text: string;
  is_anonymous: boolean | null;
  status: ModerationStatus;
  created_at: string;
  user_profiles?: { name?: string; email?: string } | null;
};

function mapComment(row: CommentRow): DevotionComment {
  return {
    id: row.id,
    devotionalId: row.devotional_id,
    firebaseUid: row.firebase_uid,
    text: row.text,
    status: row.status,
    createdAt: row.created_at,
    authorName: row.user_profiles?.name,
    authorEmail: row.user_profiles?.email,
  };
}

function mapPrayer(row: PrayerRow): DevotionPrayer {
  return {
    id: row.id,
    devotionalId: row.devotional_id,
    firebaseUid: row.firebase_uid,
    text: row.text,
    isAnonymous: Boolean(row.is_anonymous),
    status: row.status,
    createdAt: row.created_at,
    authorName: row.user_profiles?.name,
    authorEmail: row.user_profiles?.email,
  };
}

export async function listDevotionComments(): Promise<DevotionComment[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('devotional_comments')
    .select('*, user_profiles:user_id (name, email)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return ((data || []) as CommentRow[]).map(mapComment);
}

export async function updateDevotionCommentStatus(id: string, status: ModerationStatus) {
  const { data, error } = await getSupabaseAdmin()
    .from('devotional_comments')
    .update({ status })
    .eq('id', id)
    .select('*, user_profiles:user_id (name, email)')
    .single();
  if (error) throw error;
  return mapComment(data as CommentRow);
}

export async function deleteDevotionComment(id: string) {
  const { error } = await getSupabaseAdmin().from('devotional_comments').delete().eq('id', id);
  if (error) throw error;
}

export async function listDevotionPrayers(): Promise<DevotionPrayer[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('devotional_prayer_requests')
    .select('*, user_profiles:user_id (name, email)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return ((data || []) as PrayerRow[]).map(mapPrayer);
}

export async function updateDevotionPrayerStatus(id: string, status: ModerationStatus) {
  const { data, error } = await getSupabaseAdmin()
    .from('devotional_prayer_requests')
    .update({ status })
    .eq('id', id)
    .select('*, user_profiles:user_id (name, email)')
    .single();
  if (error) throw error;
  return mapPrayer(data as PrayerRow);
}

export async function deleteDevotionPrayer(id: string) {
  const { error } = await getSupabaseAdmin().from('devotional_prayer_requests').delete().eq('id', id);
  if (error) throw error;
}
