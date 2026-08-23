-- Migrate identity from Firebase Auth to Supabase Auth.
-- Run in Supabase SQL Editor AFTER live-and-devotion-engagement.sql.
--
-- Passwords cannot be imported from Firebase. Existing members keep their
-- user_profiles row (email). They create a password via the in-app
-- "Set up password" flow, which emails a link they must open.
--
-- Dashboard: Authentication → URL Configuration → Redirect URLs, add:
--   http://localhost:3000/auth/set-password
--   https://YOUR-WEBSITE/auth/set-password
--   http://localhost:3001/set-password
--   https://YOUR-ADMIN-SITE/set-password

-- ============================================
-- SCHEMA
-- ============================================

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE user_profiles
  ALTER COLUMN firebase_uid DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_user_id ON user_profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email_lower ON user_profiles (lower(email));

-- ============================================
-- LINK PROFILE ON AUTH SIGNUP / INVITE
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_id uuid;
BEGIN
  SELECT id INTO existing_id
  FROM user_profiles
  WHERE lower(email) = lower(NEW.email)
  LIMIT 1;

  IF existing_id IS NOT NULL THEN
    IF NEW.email_confirmed_at IS NOT NULL THEN
      UPDATE user_profiles
      SET auth_user_id = NEW.id
      WHERE id = existing_id AND auth_user_id IS NULL;
    END IF;
    RETURN NEW;
  END IF;

  INSERT INTO user_profiles (auth_user_id, firebase_uid, name, email, role, prefs)
  VALUES (
    NEW.id,
    NULL,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'Member'),
    NEW.email,
    'user',
    '{"notifications": true, "downloadQuality": "medium"}'::jsonb
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();

CREATE OR REPLACE FUNCTION current_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM user_profiles WHERE auth_user_id = auth.uid() LIMIT 1
$$;

CREATE OR REPLACE FUNCTION handle_auth_email_confirmed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    UPDATE user_profiles
    SET auth_user_id = NEW.id
    WHERE auth_user_id IS NULL
      AND lower(email) = lower(NEW.email);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_auth_email_confirmed();

CREATE OR REPLACE FUNCTION is_staff_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  )
$$;

GRANT EXECUTE ON FUNCTION current_profile_id() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION is_staff_admin() TO anon, authenticated;

-- ============================================
-- RLS: real Supabase JWT (auth.uid()), not x-firebase-uid
-- ============================================

DROP POLICY IF EXISTS "Users create own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users update own profile" ON user_profiles;
CREATE POLICY "Users create own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth_user_id = auth.uid());
CREATE POLICY "Users update own profile" ON user_profiles
  FOR UPDATE USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

DROP POLICY IF EXISTS "Users create comments" ON comments;
DROP POLICY IF EXISTS "Users update own comments" ON comments;
DROP POLICY IF EXISTS "Users delete own comments" ON comments;
CREATE POLICY "Users create comments" ON comments
  FOR INSERT WITH CHECK (user_id = current_profile_id());
CREATE POLICY "Users update own comments" ON comments
  FOR UPDATE USING (user_id = current_profile_id());
CREATE POLICY "Users delete own comments" ON comments
  FOR DELETE USING (user_id = current_profile_id());

DROP POLICY IF EXISTS "Users create comment likes" ON comment_likes;
DROP POLICY IF EXISTS "Users delete comment likes" ON comment_likes;
CREATE POLICY "Users create comment likes" ON comment_likes
  FOR INSERT WITH CHECK (user_id = current_profile_id());
CREATE POLICY "Users delete comment likes" ON comment_likes
  FOR DELETE USING (user_id = current_profile_id());

DROP POLICY IF EXISTS "Users read own playback history" ON playback_history;
DROP POLICY IF EXISTS "Users create playback history" ON playback_history;
DROP POLICY IF EXISTS "Users update own playback history" ON playback_history;
DROP POLICY IF EXISTS "Users delete own playback history" ON playback_history;
CREATE POLICY "Users read own playback history" ON playback_history
  FOR SELECT USING (user_id = current_profile_id());
CREATE POLICY "Users create playback history" ON playback_history
  FOR INSERT WITH CHECK (user_id = current_profile_id());
CREATE POLICY "Users update own playback history" ON playback_history
  FOR UPDATE USING (user_id = current_profile_id());
CREATE POLICY "Users delete own playback history" ON playback_history
  FOR DELETE USING (user_id = current_profile_id());

DROP POLICY IF EXISTS "Users read own downloads" ON downloads;
DROP POLICY IF EXISTS "Users create downloads" ON downloads;
DROP POLICY IF EXISTS "Users update own downloads" ON downloads;
DROP POLICY IF EXISTS "Users delete own downloads" ON downloads;
CREATE POLICY "Users read own downloads" ON downloads
  FOR SELECT USING (user_id = current_profile_id());
CREATE POLICY "Users create downloads" ON downloads
  FOR INSERT WITH CHECK (user_id = current_profile_id());
CREATE POLICY "Users update own downloads" ON downloads
  FOR UPDATE USING (user_id = current_profile_id());
CREATE POLICY "Users delete own downloads" ON downloads
  FOR DELETE USING (user_id = current_profile_id());

DROP POLICY IF EXISTS "Users create prayer requests" ON prayer_requests;
DROP POLICY IF EXISTS "Users delete own prayer requests" ON prayer_requests;
CREATE POLICY "Users create prayer requests" ON prayer_requests
  FOR INSERT WITH CHECK (user_id = current_profile_id());
CREATE POLICY "Users delete own prayer requests" ON prayer_requests
  FOR DELETE USING (user_id = current_profile_id());

DROP POLICY IF EXISTS "Users create prayer line comments" ON prayer_line_comments;
DROP POLICY IF EXISTS "Users delete own prayer line comments" ON prayer_line_comments;
CREATE POLICY "Users create prayer line comments" ON prayer_line_comments
  FOR INSERT WITH CHECK (user_id = current_profile_id());
CREATE POLICY "Users delete own prayer line comments" ON prayer_line_comments
  FOR DELETE USING (user_id = current_profile_id());

-- New writes store auth.uid() in firebase_uid when the column is still required.
ALTER TABLE comments ALTER COLUMN firebase_uid DROP NOT NULL;
ALTER TABLE comment_likes ALTER COLUMN firebase_uid DROP NOT NULL;
ALTER TABLE playback_history ALTER COLUMN firebase_uid DROP NOT NULL;
ALTER TABLE downloads ALTER COLUMN firebase_uid DROP NOT NULL;
ALTER TABLE prayer_requests ALTER COLUMN firebase_uid DROP NOT NULL;
ALTER TABLE prayer_line_comments ALTER COLUMN firebase_uid DROP NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'live_questions' AND column_name = 'firebase_uid'
  ) THEN
    EXECUTE 'ALTER TABLE live_questions ALTER COLUMN firebase_uid DROP NOT NULL';
  END IF;
END $$;
