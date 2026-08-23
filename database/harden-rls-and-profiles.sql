-- Remaining auth/RLS hardening. Safe to run after migrate-to-supabase-auth.sql.
-- Anon can read display names for comments; emails and roles stay off the public key.

REVOKE SELECT ON user_profiles FROM anon;
GRANT SELECT (id, name, avatar) ON user_profiles TO anon;

DROP POLICY IF EXISTS "Public read profiles" ON user_profiles;
DROP POLICY IF EXISTS "Public read basic profile info" ON user_profiles;
CREATE POLICY "Public read profile names" ON user_profiles
  FOR SELECT USING (true);

-- Live engagement writes go through website APIs (service role). Block direct anon writes.
DROP POLICY IF EXISTS "No anon insert live questions" ON live_questions;
CREATE POLICY "No anon insert live questions" ON live_questions
  FOR INSERT WITH CHECK (false);

DROP POLICY IF EXISTS "No anon insert devotion comments" ON devotional_comments;
CREATE POLICY "No anon insert devotion comments" ON devotional_comments
  FOR INSERT WITH CHECK (false);

DROP POLICY IF EXISTS "No anon insert devotion prayers" ON devotional_prayer_requests;
CREATE POLICY "No anon insert devotion prayers" ON devotional_prayer_requests
  FOR INSERT WITH CHECK (false);
