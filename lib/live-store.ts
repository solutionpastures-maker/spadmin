import { getSupabaseAdmin } from '@/lib/supabase-admin';

export type LiveService = {
  id: string;
  title: string;
  speaker?: string;
  description?: string;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  isLive: boolean;
  streamKey: string;
  whepUrl?: string;
  hlsUrl?: string;
  recordingUrl?: string;
  startedAt?: string | null;
  endedAt?: string | null;
  createdAt: string;
};

export type LiveQuestionStatus = 'pending' | 'answered' | 'dismissed';

export type LiveQuestion = {
  id: string;
  serviceId: string;
  firebaseUid: string;
  displayName?: string;
  text: string;
  isAnonymous: boolean;
  status: LiveQuestionStatus;
  createdAt: string;
};

type LiveServiceRow = {
  id: string;
  title: string;
  speaker: string | null;
  description: string | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  is_live: boolean | null;
  stream_key: string;
  whep_url: string | null;
  hls_url: string | null;
  recording_url: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
};

type LiveQuestionRow = {
  id: string;
  service_id: string;
  firebase_uid: string;
  display_name: string | null;
  text: string;
  is_anonymous: boolean | null;
  status: LiveQuestionStatus;
  created_at: string;
};

function mapService(row: LiveServiceRow): LiveService {
  return {
    id: row.id,
    title: row.title,
    speaker: row.speaker || undefined,
    description: row.description || undefined,
    scheduledStart: row.scheduled_start,
    scheduledEnd: row.scheduled_end,
    isLive: Boolean(row.is_live),
    streamKey: row.stream_key,
    whepUrl: row.whep_url || undefined,
    hlsUrl: row.hls_url || undefined,
    recordingUrl: row.recording_url || undefined,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    createdAt: row.created_at,
  };
}

function mapQuestion(row: LiveQuestionRow): LiveQuestion {
  return {
    id: row.id,
    serviceId: row.service_id,
    firebaseUid: row.firebase_uid,
    displayName: row.display_name || undefined,
    text: row.text,
    isAnonymous: Boolean(row.is_anonymous),
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function listLiveServices(): Promise<LiveService[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('live_services')
    .select('*')
    .order('scheduled_start', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return ((data || []) as LiveServiceRow[]).map(mapService);
}

export async function getLiveService(id: string): Promise<LiveService | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('live_services')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapService(data as LiveServiceRow) : null;
}

export async function getCurrentLiveService(): Promise<LiveService | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('live_services')
    .select('*')
    .eq('is_live', true)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapService(data as LiveServiceRow) : null;
}

export async function createLiveService(input: {
  title: string;
  speaker?: string;
  description?: string;
  scheduled_start?: string | null;
  scheduled_end?: string | null;
  stream_key?: string;
  whep_url?: string;
  hls_url?: string;
}): Promise<LiveService> {
  const { data, error } = await getSupabaseAdmin()
    .from('live_services')
    .insert({
      title: input.title,
      speaker: input.speaker || null,
      description: input.description || null,
      scheduled_start: input.scheduled_start || null,
      scheduled_end: input.scheduled_end || null,
      stream_key: input.stream_key || 'teaching',
      whep_url: input.whep_url || null,
      hls_url: input.hls_url || null,
      is_live: false,
    })
    .select()
    .single();
  if (error) throw error;
  return mapService(data as LiveServiceRow);
}

export async function updateLiveService(
  id: string,
  updates: Partial<{
    title: string;
    speaker: string;
    description: string;
    scheduled_start: string | null;
    scheduled_end: string | null;
    stream_key: string;
    whep_url: string | null;
    hls_url: string | null;
    recording_url: string | null;
    is_live: boolean;
  }>
): Promise<LiveService> {
  const payload: Record<string, unknown> = { ...updates };

  if (updates.is_live === true) {
    await getSupabaseAdmin().from('live_services').update({ is_live: false }).eq('is_live', true).neq('id', id);
    payload.started_at = new Date().toISOString();
    payload.ended_at = null;
  }
  if (updates.is_live === false) {
    payload.ended_at = new Date().toISOString();
  }

  const { data, error } = await getSupabaseAdmin()
    .from('live_services')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapService(data as LiveServiceRow);
}

export async function deleteLiveService(id: string): Promise<void> {
  const { error } = await getSupabaseAdmin().from('live_services').delete().eq('id', id);
  if (error) throw error;
}

export async function listLiveQuestions(serviceId?: string): Promise<LiveQuestion[]> {
  let query = getSupabaseAdmin()
    .from('live_questions')
    .select('*')
    .order('created_at', { ascending: true });
  if (serviceId) query = query.eq('service_id', serviceId);
  const { data, error } = await query;
  if (error) throw error;
  return ((data || []) as LiveQuestionRow[]).map(mapQuestion);
}

export async function updateLiveQuestionStatus(
  id: string,
  status: LiveQuestionStatus
): Promise<LiveQuestion> {
  const { data, error } = await getSupabaseAdmin()
    .from('live_questions')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapQuestion(data as LiveQuestionRow);
}

export async function deleteLiveQuestion(id: string): Promise<void> {
  const { error } = await getSupabaseAdmin().from('live_questions').delete().eq('id', id);
  if (error) throw error;
}
