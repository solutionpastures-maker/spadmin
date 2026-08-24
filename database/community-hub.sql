-- Community hub: public/private prayer requests, member testimonies,
-- in-app notification inbox, and event triggers.
-- Run in Supabase SQL Editor after migrate-to-supabase-auth.sql

-- ============================================
-- PRAYER REQUESTS: public by choice
-- ============================================

ALTER TABLE prayer_requests
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true;

DROP POLICY IF EXISTS "Public read prayer requests" ON prayer_requests;
CREATE POLICY "Public read prayer requests" ON prayer_requests
  FOR SELECT USING (
    status = 'visible'
    AND (
      is_public = true
      OR user_id = current_profile_id()
    )
  );

-- ============================================
-- MEMBER TESTIMONIES
-- ============================================

ALTER TABLE testimonies
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL;
ALTER TABLE testimonies
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'visible';
ALTER TABLE testimonies
  ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_testimonies_status ON testimonies(status, testimony_date DESC);

DROP POLICY IF EXISTS "Public read testimonies" ON testimonies;
CREATE POLICY "Public read testimonies" ON testimonies
  FOR SELECT USING (status = 'visible');

DROP POLICY IF EXISTS "Users create testimonies" ON testimonies;
CREATE POLICY "Users create testimonies" ON testimonies
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND (user_id IS NULL OR user_id = current_profile_id())
  );

CREATE TABLE IF NOT EXISTS testimony_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  testimony_id UUID NOT NULL REFERENCES testimonies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'visible' CHECK (status IN ('visible', 'flagged', 'removed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_testimony_comments_testimony ON testimony_comments(testimony_id, created_at DESC);

ALTER TABLE testimony_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read testimony comments" ON testimony_comments;
CREATE POLICY "Public read testimony comments" ON testimony_comments
  FOR SELECT USING (status = 'visible');

DROP POLICY IF EXISTS "Users create testimony comments" ON testimony_comments;
CREATE POLICY "Users create testimony comments" ON testimony_comments
  FOR INSERT WITH CHECK (user_id = current_profile_id());

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_broadcast ON notifications(created_at DESC)
  WHERE recipient_id IS NULL;

CREATE TABLE IF NOT EXISTS notification_reads (
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (notification_id, user_id)
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own notifications" ON notifications;
CREATE POLICY "Users read own notifications" ON notifications
  FOR SELECT USING (
    recipient_id IS NULL
    OR recipient_id = current_profile_id()
  );

DROP POLICY IF EXISTS "Users read own notification reads" ON notification_reads;
CREATE POLICY "Users read own notification reads" ON notification_reads
  FOR SELECT USING (user_id = current_profile_id());

DROP POLICY IF EXISTS "Users insert notification reads" ON notification_reads;
CREATE POLICY "Users insert notification reads" ON notification_reads
  FOR INSERT WITH CHECK (user_id = current_profile_id());

GRANT SELECT, INSERT ON testimonies TO authenticated;
GRANT SELECT ON testimonies TO anon;
GRANT SELECT, INSERT ON testimony_comments TO authenticated;
GRANT SELECT ON testimony_comments TO anon;

-- ============================================
-- HELPERS + TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION notify_broadcast(p_type TEXT, p_title TEXT, p_body TEXT, p_data JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO notifications (recipient_id, type, title, body, data)
  VALUES (NULL, p_type, p_title, p_body, COALESCE(p_data, '{}'::jsonb));
END;
$$;

CREATE OR REPLACE FUNCTION notify_user(p_recipient UUID, p_type TEXT, p_title TEXT, p_body TEXT, p_data JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_recipient IS NULL THEN
    RETURN;
  END IF;
  INSERT INTO notifications (recipient_id, type, title, body, data)
  VALUES (p_recipient, p_type, p_title, p_body, COALESCE(p_data, '{}'::jsonb));
END;
$$;

CREATE OR REPLACE FUNCTION trg_notify_series()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM notify_broadcast(
    'series',
    'New series',
    COALESCE(NEW.title, 'A new teaching series is available'),
    jsonb_build_object('seriesId', NEW.id)
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION trg_notify_episode()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM notify_broadcast(
    'episode',
    'New teaching',
    COALESCE(NEW.title, 'A new episode is available'),
    jsonb_build_object('episodeId', NEW.id, 'seriesId', NEW.series_id)
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION trg_notify_devotional()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM notify_broadcast(
    'devotional',
    'Today''s devotion',
    COALESCE(NEW.title, 'A new devotion is ready'),
    jsonb_build_object('devotionalId', NEW.id)
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION trg_notify_announcement()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM notify_broadcast(
    'announcement',
    COALESCE(NEW.title, 'Church announcement'),
    left(COALESCE(NEW.body, ''), 140),
    jsonb_build_object('announcementId', NEW.id)
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION trg_notify_live()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.is_live IS TRUE AND COALESCE(OLD.is_live, false) IS DISTINCT FROM TRUE THEN
    PERFORM notify_broadcast(
      'live',
      'We''re live',
      COALESCE(NEW.title, 'Tuesday Teaching is live now'),
      jsonb_build_object('live', true)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION trg_notify_testimony()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'visible' THEN
    PERFORM notify_broadcast(
      'testimony',
      'New testimony',
      CASE WHEN NEW.is_anonymous THEN 'A member shared a testimony'
           ELSE COALESCE(NEW.name, 'A member') || ' shared a testimony'
      END,
      jsonb_build_object('testimonyId', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION trg_notify_comment_reply()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  parent_user UUID;
BEGIN
  IF NEW.parent_id IS NULL THEN
    RETURN NEW;
  END IF;
  SELECT user_id INTO parent_user FROM comments WHERE id = NEW.parent_id;
  IF parent_user IS NOT NULL AND parent_user IS DISTINCT FROM NEW.user_id THEN
    PERFORM notify_user(
      parent_user,
      'comment_reply',
      'New reply on your comment',
      left(COALESCE(NEW.text, ''), 140),
      jsonb_build_object('episodeId', NEW.episode_id, 'commentId', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION trg_notify_testimony_comment()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  owner UUID;
BEGIN
  SELECT user_id INTO owner FROM testimonies WHERE id = NEW.testimony_id;
  IF owner IS NOT NULL AND owner IS DISTINCT FROM NEW.user_id THEN
    PERFORM notify_user(
      owner,
      'testimony_comment',
      'Someone commented on your testimony',
      left(COALESCE(NEW.text, ''), 140),
      jsonb_build_object('testimonyId', NEW.testimony_id)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_series_notify ON series;
DROP TRIGGER IF EXISTS on_episode_notify ON episodes;
DROP TRIGGER IF EXISTS on_devotional_notify ON devotionals;
DROP TRIGGER IF EXISTS on_announcement_notify ON announcements;
DROP TRIGGER IF EXISTS on_live_notify ON live_services;
DROP TRIGGER IF EXISTS on_testimony_notify ON testimonies;
DROP TRIGGER IF EXISTS on_comment_reply_notify ON comments;
DROP TRIGGER IF EXISTS on_testimony_comment_notify ON testimony_comments;

DO $$
BEGIN
  IF to_regclass('public.series') IS NOT NULL THEN
    CREATE TRIGGER on_series_notify AFTER INSERT ON series
      FOR EACH ROW EXECUTE FUNCTION trg_notify_series();
  END IF;
  IF to_regclass('public.episodes') IS NOT NULL THEN
    CREATE TRIGGER on_episode_notify AFTER INSERT ON episodes
      FOR EACH ROW EXECUTE FUNCTION trg_notify_episode();
  END IF;
  IF to_regclass('public.devotionals') IS NOT NULL THEN
    CREATE TRIGGER on_devotional_notify AFTER INSERT ON devotionals
      FOR EACH ROW EXECUTE FUNCTION trg_notify_devotional();
  END IF;
  IF to_regclass('public.announcements') IS NOT NULL THEN
    CREATE TRIGGER on_announcement_notify AFTER INSERT ON announcements
      FOR EACH ROW EXECUTE FUNCTION trg_notify_announcement();
  END IF;
  IF to_regclass('public.live_services') IS NOT NULL THEN
    CREATE TRIGGER on_live_notify AFTER INSERT OR UPDATE OF is_live ON live_services
      FOR EACH ROW EXECUTE FUNCTION trg_notify_live();
  END IF;
  IF to_regclass('public.testimonies') IS NOT NULL THEN
    CREATE TRIGGER on_testimony_notify AFTER INSERT ON testimonies
      FOR EACH ROW EXECUTE FUNCTION trg_notify_testimony();
  END IF;
  IF to_regclass('public.comments') IS NOT NULL THEN
    CREATE TRIGGER on_comment_reply_notify AFTER INSERT ON comments
      FOR EACH ROW EXECUTE FUNCTION trg_notify_comment_reply();
  END IF;
  IF to_regclass('public.testimony_comments') IS NOT NULL THEN
    CREATE TRIGGER on_testimony_comment_notify AFTER INSERT ON testimony_comments
      FOR EACH ROW EXECUTE FUNCTION trg_notify_testimony_comment();
  END IF;
END $$;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;
