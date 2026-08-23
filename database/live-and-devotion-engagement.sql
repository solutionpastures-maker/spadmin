-- Live teaching + devotion engagement
-- Run in Supabase SQL Editor after schema-complete.sql and fix-rls-firebase-auth.sql
--
-- Encoder (church PC, not this database):
--   Soundcraft Si Impact USB -> REAPER stereo streaming bus
--   -> FFmpeg -> MediaMTX (WebRTC WHEP + HLS)
--   Example:
--     ffmpeg -f dshow -i audio="CABLE Output (VB-Audio Virtual Cable)" ^
--       -c:a libopus -f rtsp rtsp://127.0.0.1:8554/teaching
--   Playback:
--     WHEP  http://STREAM_HOST:8889/teaching/whep
--     HLS   http://STREAM_HOST:8888/teaching/index.m3u8
-- Expose STREAM_HOST with a tunnel (Cloudflare) or public IP + TURN for phones off Wi-Fi.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION get_firebase_uid()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.header.x-firebase-uid', true),
    ''
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================
-- LIVE SERVICES
-- ============================================

CREATE TABLE IF NOT EXISTS live_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL DEFAULT 'Tuesday Teaching',
    speaker VARCHAR(255),
    description TEXT,
    scheduled_start TIMESTAMP WITH TIME ZONE,
    scheduled_end TIMESTAMP WITH TIME ZONE,
    is_live BOOLEAN DEFAULT false,
    stream_key VARCHAR(100) NOT NULL DEFAULT 'teaching',
    whep_url TEXT,
    hls_url TEXT,
    recording_url TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_live_services_is_live ON live_services(is_live);
CREATE INDEX IF NOT EXISTS idx_live_services_scheduled_start ON live_services(scheduled_start DESC);

CREATE TABLE IF NOT EXISTS live_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES live_services(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    firebase_uid VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    text TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_live_questions_service ON live_questions(service_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_live_questions_status ON live_questions(status);

-- ============================================
-- DEVOTIONAL COMMENTS + PRAYER REQUESTS
-- ============================================

CREATE TABLE IF NOT EXISTS devotional_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    devotional_id UUID NOT NULL REFERENCES devotionals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    firebase_uid VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'visible' CHECK (status IN ('visible', 'flagged', 'removed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_devotional_comments_devotional ON devotional_comments(devotional_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_devotional_comments_status ON devotional_comments(status);

CREATE TABLE IF NOT EXISTS devotional_prayer_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    devotional_id UUID NOT NULL REFERENCES devotionals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    firebase_uid VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'visible' CHECK (status IN ('visible', 'flagged', 'removed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_devotional_prayers_devotional ON devotional_prayer_requests(devotional_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_devotional_prayers_status ON devotional_prayer_requests(status);

DROP TRIGGER IF EXISTS update_live_services_updated_at ON live_services;
CREATE TRIGGER update_live_services_updated_at BEFORE UPDATE ON live_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_live_questions_updated_at ON live_questions;
CREATE TRIGGER update_live_questions_updated_at BEFORE UPDATE ON live_questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_devotional_comments_updated_at ON devotional_comments;
CREATE TRIGGER update_devotional_comments_updated_at BEFORE UPDATE ON devotional_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_devotional_prayers_updated_at ON devotional_prayer_requests;
CREATE TRIGGER update_devotional_prayers_updated_at BEFORE UPDATE ON devotional_prayer_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS
-- Member writes go through Next.js APIs (service role) after Firebase ID token verify.
-- ============================================

ALTER TABLE live_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE devotional_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE devotional_prayer_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read live services" ON live_services;
CREATE POLICY "Public read live services" ON live_services
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "No anon write live services" ON live_services;
CREATE POLICY "No anon write live services" ON live_services
    FOR ALL USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "No anon read live questions" ON live_questions;
CREATE POLICY "No anon read live questions" ON live_questions
    FOR SELECT USING (false);

DROP POLICY IF EXISTS "No anon write live questions" ON live_questions;
CREATE POLICY "No anon write live questions" ON live_questions
    FOR ALL USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "Public read visible devotion comments" ON devotional_comments;
CREATE POLICY "Public read visible devotion comments" ON devotional_comments
    FOR SELECT USING (status = 'visible');

DROP POLICY IF EXISTS "No anon write devotion comments" ON devotional_comments;
CREATE POLICY "No anon write devotion comments" ON devotional_comments
    FOR INSERT WITH CHECK (false);

DROP POLICY IF EXISTS "No anon update devotion comments" ON devotional_comments;
CREATE POLICY "No anon update devotion comments" ON devotional_comments
    FOR UPDATE USING (false);

DROP POLICY IF EXISTS "No anon delete devotion comments" ON devotional_comments;
CREATE POLICY "No anon delete devotion comments" ON devotional_comments
    FOR DELETE USING (false);

DROP POLICY IF EXISTS "Public read visible devotion prayers" ON devotional_prayer_requests;
CREATE POLICY "Public read visible devotion prayers" ON devotional_prayer_requests
    FOR SELECT USING (status = 'visible');

DROP POLICY IF EXISTS "No anon write devotion prayers" ON devotional_prayer_requests;
CREATE POLICY "No anon write devotion prayers" ON devotional_prayer_requests
    FOR INSERT WITH CHECK (false);

DROP POLICY IF EXISTS "No anon update devotion prayers" ON devotional_prayer_requests;
CREATE POLICY "No anon update devotion prayers" ON devotional_prayer_requests
    FOR UPDATE USING (false);

DROP POLICY IF EXISTS "No anon delete devotion prayers" ON devotional_prayer_requests;
CREATE POLICY "No anon delete devotion prayers" ON devotional_prayer_requests
    FOR DELETE USING (false);

-- ============================================
-- HARDENING: freeze role + fix prayer-line RLS for Firebase header auth
-- ============================================

CREATE OR REPLACE FUNCTION freeze_user_profile_role()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND auth.role() IS DISTINCT FROM 'service_role' THEN
    NEW.role := 'user';
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.role IS DISTINCT FROM OLD.role AND auth.role() IS DISTINCT FROM 'service_role' THEN
    NEW.role := OLD.role;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS freeze_user_profile_role ON user_profiles;
CREATE TRIGGER freeze_user_profile_role
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION freeze_user_profile_role();

DROP POLICY IF EXISTS "Users create prayer requests" ON prayer_requests;
CREATE POLICY "Users create prayer requests" ON prayer_requests
  FOR INSERT WITH CHECK (
    get_firebase_uid() != '' AND
    firebase_uid = get_firebase_uid()
  );

DROP POLICY IF EXISTS "Users delete own prayer requests" ON prayer_requests;
CREATE POLICY "Users delete own prayer requests" ON prayer_requests
  FOR DELETE USING (firebase_uid = get_firebase_uid());

DROP POLICY IF EXISTS "Users create prayer line comments" ON prayer_line_comments;
CREATE POLICY "Users create prayer line comments" ON prayer_line_comments
  FOR INSERT WITH CHECK (
    get_firebase_uid() != '' AND
    firebase_uid = get_firebase_uid()
  );

DROP POLICY IF EXISTS "Users delete own prayer line comments" ON prayer_line_comments;
CREATE POLICY "Users delete own prayer line comments" ON prayer_line_comments
  FOR DELETE USING (firebase_uid = get_firebase_uid());
