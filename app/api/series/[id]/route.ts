import { NextRequest, NextResponse } from 'next/server';
import { apiErrorResponse } from '@/lib/api-error';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/auth/require-admin';

// GET /api/series/[id] - Get series by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
)  {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;

  try {
    const { id } = await params;
    const { data, error } = await getSupabaseAdmin()
      .from('series')
      .select('*')
      .eq('id', id)
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

// PUT /api/series/[id] - Update series
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
      .from('series')
      .update({
        title: body.title,
        description: body.description,
        image_url: body.imageUrl,
        scripture: body.scripture,
        tags: body.tags,
      })
      .eq('id', id)
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

// DELETE /api/series/[id] - Delete series
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
)  {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;

  try {
    const { id } = await params;
    const { error } = await getSupabaseAdmin()
      .from('series')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return apiErrorResponse(error);
  }
}

