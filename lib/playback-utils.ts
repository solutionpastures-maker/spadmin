import { EpisodePart } from './types';
import { convertDriveFileIdToStreamUrl, extractDriveFileId } from './drive-utils';

export const SERMON_AUDIO_BUCKET = 'sermon-audio';

/** Default Supabase Free tier global upload cap */
export const SERMON_AUDIO_MAX_MB = 50;
export const SERMON_AUDIO_MAX_BYTES = SERMON_AUDIO_MAX_MB * 1024 * 1024;

export type EpisodePartSource = 'supabase' | 'drive';

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Reject before upload when file exceeds project storage limit */
export function assertAudioFileWithinLimit(
  file: File,
  maxBytes: number = SERMON_AUDIO_MAX_BYTES
): void {
  if (file.size <= maxBytes) return;
  throw new Error(
    `This file is ${formatFileSize(file.size)}. Your Supabase project allows up to ${formatFileSize(maxBytes)} per upload. ` +
      'Use a smaller/compressed MP3, split into multiple parts, or use the Google Drive tab.'
  );
}

export function isAudioFileTooLarge(
  file: File,
  maxBytes: number = SERMON_AUDIO_MAX_BYTES
): boolean {
  return file.size > maxBytes;
}

/** Normalize legacy rows that only have fileId */
export function normalizeEpisodePart(part: EpisodePart): EpisodePart & { source: EpisodePartSource } {
  if (part.source === 'supabase' || part.source === 'drive') {
    return part as EpisodePart & { source: EpisodePartSource };
  }
  if (part.storagePath) {
    return { ...part, source: 'supabase' };
  }
  if (part.fileId) {
    return { ...part, source: 'drive' };
  }
  return { ...part, source: 'drive' };
}

export function getPublicStorageUrl(bucket: string, storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') || '';
  const encoded = storagePath.split('/').map(encodeURIComponent).join('/');
  return `${base}/storage/v1/object/public/${bucket}/${encoded}`;
}

export function getPartPlaybackUrl(part: EpisodePart): string | null {
  const normalized = normalizeEpisodePart(part);

  if (normalized.source === 'supabase' && normalized.storagePath) {
    return getPublicStorageUrl(SERMON_AUDIO_BUCKET, normalized.storagePath);
  }

  if (normalized.fileId) {
    const id = extractDriveFileId(normalized.fileId) || normalized.fileId;
    return convertDriveFileIdToStreamUrl(id);
  }

  return null;
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Read audio duration from a local File in the browser */
export function getAudioDurationFromFile(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      const duration = Math.round(audio.duration);
      if (Number.isFinite(duration) && duration > 0) {
        resolve(duration);
      } else {
        reject(new Error('Could not read audio duration'));
      }
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load audio file'));
    };
    audio.src = url;
  });
}
