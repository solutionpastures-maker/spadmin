-- Notification cleanup on announcement delete + event attendance (RSVP).
-- Run in Supabase SQL Editor after announcements-structured.sql

-- Remove hub notifications that pointed at a deleted announcement
CREATE OR REPLACE FUNCTION cleanup_announcement_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM notifications
  WHERE (data->>'announcementId') = OLD.id::text;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_announcement_deleted_cleanup_notifications ON announcements;
CREATE TRIGGER on_announcement_deleted_cleanup_notifications
  AFTER DELETE ON announcements
  FOR EACH ROW EXECUTE FUNCTION cleanup_announcement_notifications();

-- One-time cleanup for already-deleted announcements still lingering in the hub
DELETE FROM notifications n
WHERE n.data ? 'announcementId'
  AND NOT EXISTS (
    SELECT 1 FROM announcements a
    WHERE a.id::text = n.data->>'announcementId'
  );

-- Event attendance (Attend / Not attending)
CREATE TABLE IF NOT EXISTS event_attendances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  day TEXT NOT NULL DEFAULT 'special',
  status TEXT NOT NULL CHECK (status IN ('attending', 'not_attending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, announcement_id, day)
);

CREATE INDEX IF NOT EXISTS idx_event_attendances_announcement
  ON event_attendances(announcement_id, day);

ALTER TABLE event_attendances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own attendance" ON event_attendances;
CREATE POLICY "Users read own attendance" ON event_attendances
  FOR SELECT USING (user_id = current_profile_id());

DROP POLICY IF EXISTS "Users upsert own attendance" ON event_attendances;
CREATE POLICY "Users upsert own attendance" ON event_attendances
  FOR INSERT WITH CHECK (user_id = current_profile_id());

DROP POLICY IF EXISTS "Users update own attendance" ON event_attendances;
CREATE POLICY "Users update own attendance" ON event_attendances
  FOR UPDATE USING (user_id = current_profile_id());

DROP POLICY IF EXISTS "Users delete own attendance" ON event_attendances;
CREATE POLICY "Users delete own attendance" ON event_attendances
  FOR DELETE USING (user_id = current_profile_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON event_attendances TO authenticated;

DROP TRIGGER IF EXISTS update_event_attendances_updated_at ON event_attendances;
CREATE TRIGGER update_event_attendances_updated_at
  BEFORE UPDATE ON event_attendances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
