-- Structured announcements: special vs weekly (Mon–Sun) activities with event times.
-- Run in Supabase SQL Editor after community-hub.sql (or independently).

ALTER TABLE announcements
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'special';

ALTER TABLE announcements
  ADD COLUMN IF NOT EXISTS week_start DATE;

ALTER TABLE announcements
  ADD COLUMN IF NOT EXISTS days JSONB NOT NULL DEFAULT '[]'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'announcements_type_check'
  ) THEN
    ALTER TABLE announcements
      ADD CONSTRAINT announcements_type_check
      CHECK (type IN ('special', 'weekly'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(type);
CREATE INDEX IF NOT EXISTS idx_announcements_week_start ON announcements(week_start DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_days_gin ON announcements USING GIN (days);

COMMENT ON COLUMN announcements.type IS 'special = one-off message; weekly = Mon–Sun activities';
COMMENT ON COLUMN announcements.week_start IS 'Monday date for weekly activity packs';
COMMENT ON COLUMN announcements.days IS
  '[{ "day":"monday","text":"...","startsAt":"ISO optional","location":"optional" }] — omit empty days';
