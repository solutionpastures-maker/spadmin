/**
 * Live `devotionals` still has leftover NOT NULL columns (date, verse_text, …)
 * that the CMS form does not send. Prefill known aliases, then retry on
 * Postgres "null value in column" errors so new required columns fail closed
 * with a fill instead of a 500.
 */

export function parseNotNullColumn(message: string): string | null {
  const match = /null value in column "([^"]+)"/i.exec(message);
  return match?.[1] ?? null;
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return slug || `devotional-${Date.now()}`;
}

export function coerceDate(value: unknown): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === 'number' && Number.isFinite(value)) {
    const fromNumber = new Date(value);
    if (!Number.isNaN(fromNumber.getTime())) return fromNumber;
  }
  if (typeof value === 'string' && value.trim()) {
    const trimmed = value.trim();
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) return parsed;
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const fromDay = new Date(`${trimmed}T12:00:00`);
      if (!Number.isNaN(fromDay.getTime())) return fromDay;
    }
  }
  return new Date();
}

export function toIsoDate(value: unknown): string {
  return coerceDate(value).toISOString();
}

export function formatDateTime(value: unknown): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(coerceDate(value));
}

export function valueForRequiredColumn(
  column: string,
  row: Record<string, unknown>
): unknown {
  const title = String(row.title || 'Devotional');
  const content = String(row.content || row.body || '');
  const verse = String(row.verse || row.verse_reference || '');
  const verseText = String(row.verse_text || verse || content.slice(0, 240) || title);
  const published = toIsoDate(row.published_at || row.date);

  switch (column) {
    case 'date':
    case 'publish_date':
      return coerceDate(published).toISOString().slice(0, 10);
    case 'published_at':
      return published;
    case 'verse':
    case 'verse_reference':
    case 'verse_ref':
    case 'scripture_reference':
      return verse;
    case 'verse_text':
    case 'scripture_text':
    case 'scripture':
      return verseText;
    case 'slug':
      return slugify(title);
    case 'excerpt':
    case 'summary':
      return content.slice(0, 180) || title;
    case 'body':
    case 'content':
      return content || title;
    case 'author':
      return row.author || '';
    case 'image_url':
    case 'cover_image':
      return row.image_url || '';
    case 'title':
      return title;
    default:
      if (typeof row[column] === 'string') return row[column];
      return '';
  }
}

export function applyKnownDevotionalColumns(
  row: Record<string, unknown>,
  existingColumns: string[]
): Record<string, unknown> {
  const next = { ...row };
  const wanted = [
    'date',
    'published_at',
    'verse',
    'verse_text',
    'verse_reference',
    'verse_ref',
    'scripture',
    'scripture_text',
    'scripture_reference',
    'slug',
    'excerpt',
    'summary',
    'body',
    'author',
    'image_url',
  ];
  for (const column of wanted) {
    if (!existingColumns.includes(column)) continue;
    if (next[column] != null && next[column] !== '') continue;
    next[column] = valueForRequiredColumn(column, next);
  }
  return next;
}
