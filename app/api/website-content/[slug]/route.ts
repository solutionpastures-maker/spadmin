import { NextRequest, NextResponse } from 'next/server';
import { getWebsiteContent, upsertWebsiteContent, WebsiteContentSlug } from '@/lib/supabase-admin';
import { defaultAboutContent, defaultFooterContent } from '@/lib/website-defaults';
import { AboutContent, FooterContent } from '@/lib/types';
import { requireAdmin } from '@/lib/auth/require-admin';

const VALID_SLUGS: WebsiteContentSlug[] = ['footer', 'about'];

function isValidSlug(slug: string): slug is WebsiteContentSlug {
  return VALID_SLUGS.includes(slug as WebsiteContentSlug);
}

function getDefaultContent(slug: WebsiteContentSlug) {
  return slug === 'footer' ? defaultFooterContent : defaultAboutContent;
}

export async function GET(request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
)  {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;

  try {
    const { slug } = await params;
    if (!isValidSlug(slug)) {
      return NextResponse.json({ error: 'Invalid content slug' }, { status: 400 });
    }

    const data = await getWebsiteContent<FooterContent | AboutContent>(slug);
    return NextResponse.json(data ?? getDefaultContent(slug));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
)  {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;

  try {
    const { slug } = await params;
    if (!isValidSlug(slug)) {
      return NextResponse.json({ error: 'Invalid content slug' }, { status: 400 });
    }

    const body = await request.json();
    const data = await upsertWebsiteContent(slug, body);
    return NextResponse.json(data.content);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
