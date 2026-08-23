import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const ALLOWED_BUCKETS = new Set(['series', 'gallery', 'website', 'announcements', 'devotionals']);

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const bucketRaw = typeof formData.get('bucket') === 'string' ? String(formData.get('bucket')) : 'series';
    const pathRaw = typeof formData.get('path') === 'string' ? String(formData.get('path')) : '';

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Please choose an image file' }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image must be 10MB or smaller' }, { status: 400 });
    }
    if (!ALLOWED_BUCKETS.has(bucketRaw)) {
      return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 });
    }
    if (!pathRaw || pathRaw.includes('..') || pathRaw.startsWith('/')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { data, error } = await getSupabaseAdmin().storage.from(bucketRaw).upload(pathRaw, buffer, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    });
    if (error) throw error;

    const { data: urlData } = getSupabaseAdmin().storage.from(bucketRaw).getPublicUrl(data.path);
    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
