import { NextRequest, NextResponse } from 'next/server';
import { SERMON_AUDIO_BUCKET, SERMON_AUDIO_MAX_BYTES } from '@/lib/playback-utils';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/auth/require-admin';

const AUDIO_MIME: Record<string, string> = {
  mp3: 'audio/mpeg',
  mpeg: 'audio/mpeg',
  mp4: 'audio/mp4',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  webm: 'audio/webm',
};

function guessContentType(filename: string, fallback?: string): string {
  if (fallback && fallback.startsWith('audio/')) return fallback;
  const ext = filename.split('.').pop()?.toLowerCase() || 'mp3';
  return AUDIO_MIME[ext] || 'audio/mpeg';
}

export async function POST(request: NextRequest)  {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Supabase is not configured on the server' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const seriesId = formData.get('seriesId');
    const uploadSessionId = formData.get('uploadSessionId');
    const partIndex = formData.get('partIndex');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (file.size > SERMON_AUDIO_MAX_BYTES) {
      return NextResponse.json(
        {
          error: `File exceeds the ${SERMON_AUDIO_MAX_BYTES / (1024 * 1024)}MB upload limit. Use a smaller file, split into parts, or use Google Drive.`,
        },
        { status: 413 }
      );
    }
    if (typeof seriesId !== 'string' || !seriesId) {
      return NextResponse.json({ error: 'seriesId is required' }, { status: 400 });
    }
    if (typeof uploadSessionId !== 'string' || !uploadSessionId) {
      return NextResponse.json({ error: 'uploadSessionId is required' }, { status: 400 });
    }
    const index =
      typeof partIndex === 'string' ? parseInt(partIndex, 10) : Number(partIndex) || 1;

    const ext = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : 'mp3';
    const storagePath = `${seriesId}/${uploadSessionId}/part-${String(index).padStart(2, '0')}.${ext}`;
    const contentType = guessContentType(file.name, file.type);

    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await getSupabaseAdmin().storage
      .from(SERMON_AUDIO_BUCKET)
      .upload(storagePath, buffer, {
        contentType,
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      const msg = error.message?.toLowerCase() || '';
      if (msg.includes('bucket not found')) {
        return NextResponse.json(
          {
            error:
              'sermon-audio bucket not found. Run: npm run create-audio-bucket',
          },
          { status: 400 }
        );
      }
      if (msg.includes('maximum allowed size') || msg.includes('entitytoolarge')) {
        return NextResponse.json(
          {
            error: `File exceeds your Supabase storage limit (typically 50MB on Free). Use a smaller file, split into parts, or use Google Drive.`,
          },
          { status: 413 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      storagePath,
      source: 'supabase' as const,
      contentType,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
