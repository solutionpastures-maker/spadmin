import { NextRequest, NextResponse } from 'next/server';
import { apiErrorResponse } from '@/lib/api-error';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/auth/require-admin';

// GET /api/episodes/[id] - Get episode by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
)  {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;

  try {
    const { id } = await params;
    const { data, error } = await getSupabaseAdmin()
      .from('episodes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error: unknown) {
    return apiErrorResponse(error);
  }
}

// PUT /api/episodes/[id] - Update episode
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
)  {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;

  try {
    const { id } = await params;
    const body = await request.json();
    const { data, error } = await getSupabaseAdmin()
      .from('episodes')
      .update({
        title: body.title,
        description: body.description,
        speaker: body.speaker,
        published_at: body.published_at,
        image_url: body.image_url,
        scripture: body.scripture,
        transcript_url: body.transcript_url,
        parts: body.parts,
        chapters: body.chapters,
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error: unknown) {
    return apiErrorResponse(error);
  }
}

// DELETE /api/episodes/[id] - Delete episode
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
)  {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;

  try {
    const { id } = await params;
    const { error } = await getSupabaseAdmin()
      .from('episodes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return apiErrorResponse(error);
  }
}

