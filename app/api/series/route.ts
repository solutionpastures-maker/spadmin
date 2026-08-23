import { NextRequest, NextResponse } from 'next/server';
import { apiErrorResponse } from '@/lib/api-error';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import type { SeriesRow } from '@/lib/supabase-rows';
import { requireAdmin } from '@/lib/auth/require-admin';

// GET /api/series - Get all series
export async function GET(request: NextRequest)  {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('series')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const transformed = data.map((s: SeriesRow) => ({
      id: s.id,
      title: s.title,
      description: s.description || '',
      imageUrl: s.image_url,
      scripture: s.scripture,
      tags: s.tags || [],
      createdAt: new Date(s.created_at),
    }));

    return NextResponse.json(transformed);
  } catch (error: unknown) {
    return apiErrorResponse(error);
  }
}

// POST /api/series - Create new series
export async function POST(request: NextRequest)  {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;

  try {
    const body = await request.json();
    const { data, error } = await getSupabaseAdmin()
      .from('series')
      .insert({
        title: body.title,
        description: body.description,
        image_url: body.imageUrl,
        scripture: body.scripture,
        tags: body.tags || [],
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      id: data.id,
      title: data.title,
      description: data.description || '',
      imageUrl: data.image_url,
      scripture: data.scripture,
      tags: data.tags || [],
      createdAt: new Date(data.created_at),
    });
  } catch (error: unknown) {
    return apiErrorResponse(error);
  }
}
