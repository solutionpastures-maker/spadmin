/**
 * Utility functions for Google Drive integration
 * Matches mobile app driveUtils.ts
 */

/**
 * Extract file ID from Google Drive share URL
 * Supports formats:
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 */
export function extractDriveFileId(url: string): string | null {
  // Pattern 1: /file/d/FILE_ID/
  const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match1) return match1[1];

  // Pattern 2: ?id=FILE_ID
  const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2) return match2[1];

  // Pattern 3: /uc?id=FILE_ID
  const match3 = url.match(/\/uc\?id=([a-zA-Z0-9_-]+)/);
  if (match3) return match3[1];

  return null;
}

/**
 * Convert Google Drive share link to direct stream URL
 * @param shareUrl - Google Drive share URL
 * @returns Direct stream URL for audio playback
 */
export function convertDriveToStreamUrl(shareUrl: string): string {
  const fileId = extractDriveFileId(shareUrl);
  if (!fileId) {
    throw new Error('Invalid Google Drive URL format');
  }
  return convertDriveFileIdToStreamUrl(fileId);
}

/** Stream URL for playback (range requests / seeking) — matches mobile app */
export function convertDriveFileIdToStreamUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=open&id=${fileId}`;
}

/**
 * Validate Google Drive URL format
 */
export function isValidDriveUrl(url: string): boolean {
  return extractDriveFileId(url) !== null;
}

