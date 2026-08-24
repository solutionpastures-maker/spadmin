-- Align leftover live columns with the CMS payload.
-- Safe to re-run. Optional: admin also retries NOT NULL gaps in code.

UPDATE devotionals
SET date = COALESCE(date, published_at::date, CURRENT_DATE)
WHERE date IS NULL;

UPDATE devotionals
SET verse_text = COALESCE(
  NULLIF(verse_text, ''),
  NULLIF(verse, ''),
  NULLIF(content, ''),
  title
)
WHERE verse_text IS NULL;

ALTER TABLE devotionals ALTER COLUMN date DROP NOT NULL;
ALTER TABLE devotionals ALTER COLUMN date SET DEFAULT CURRENT_DATE;

ALTER TABLE devotionals ALTER COLUMN verse_text DROP NOT NULL;
ALTER TABLE devotionals ALTER COLUMN verse_text SET DEFAULT '';
