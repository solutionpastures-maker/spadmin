import { NextRequest, NextResponse } from 'next/server';
import { apiErrorResponse } from '@/lib/api-error';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/auth/require-admin';

// GET /api/episodes?seriesId=xxx - Get episodes (optionally filtered by series)
export async function GET(request: NextRequest)  {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;

  try {
    const searchParams = request.nextUrl.searchParams;
    const seriesId = searchParams.get('seriesId');
    
    let query = getSupabaseAdmin()
      .from('episodes')
      .select('*')
      .order('published_at', { ascending: false });
    
    if (seriesId) {
      query = query.eq('series_id', seriesId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error: unknown) {
    return apiErrorResponse(error);
  }
}

// POST /api/episodes - Create new episode
export async function POST(request: NextRequest)  {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;

  try {
    const body = await request.json();
    const { data, error } = await getSupabaseAdmin()
      .from('episodes')
      .insert({
        series_id: body.series_id,
        title: body.title,
        description: body.description,
        speaker: body.speaker,
        published_at: body.published_at,
        image_url: body.image_url,
        scripture: body.scripture,
        transcript_url: body.transcript_url,
        parts: body.parts,
        chapters: body.chapters || [],
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error: unknown) {
    return apiErrorResponse(error);
  }
}

